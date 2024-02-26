/*
 *  Author:     Nawed Anjum
 *
 *  Copyright (c) 2014-2019. All rights reserved.
 */
var _ = require('lodash');
var async = require('async');
var winston = require('../logger');
var marked = require('marked');
var sanitizeHtml = require('sanitize-html');
var utils = require('../helpers/utils');
var emitter = require('../emitter');
var socketEvents = require('./socketEventConsts');
var ticketSchema = require('../models/ticket');
var prioritySchema = require('../models/ticketpriority');
var userSchema = require('../models/user');
var roleSchema = require('../models/role');
const teamSchema = require('../models/team');
const DepartmentSchema = require('../models/department');
var permissions = require('../permissions');
var xss = require('xss');

var events = {};

function register(socket) {
  events.onUpdateTicketGrid(socket);
  events.onUpdateTicketStatus(socket);
  events.onUpdateTicket(socket);
  events.onUpdateAssigneeList(socket);
  events.onSetAssignee(socket);
  events.onUpdateTicketTags(socket);
  events.onClearAssignee(socket);
  events.onSetTicketType(socket);
  events.onSetTicketPriority(socket);
  events.onSetTicketGroup(socket);
  events.onSetTicketDueDate(socket);
  events.onSetTicketIssue(socket);
  events.onCommentNoteSet(socket);
  events.onRemoveCommentNote(socket);
  events.onAttachmentsUIUpdate(socket);
  events.onSetTicketTeam(socket);
  events.onUpdateTeamAssigneeList(socket);
  events.onCommentQueryMarkAsResolved(socket);
  events.onUpdateGroupTeamList(socket);
  events.onClearTeam(socket);
}

function eventLoop() {}

events.onUpdateTicketGrid = function (socket) {
  socket.on('ticket:updategrid', function () {
    utils.sendToAllConnectedClients(io, 'ticket:updategrid');
  });
};

events.onUpdateTicketStatus = (socket) => {
  socket.on(socketEvents.TICKETS_STATUS_SET, async (data) => {
    const ticketId = data._id;
    const status = data.value;
    const ownerId = socket.request.user._id;
    // winston.debug('Received Status')
    try {
      let ticket = await ticketSchema.getTicketById(ticketId);
      ticket = await ticket.setStatus(ownerId, status);
      ticket = await ticket.save();
      ticket = await ticket.populate('status');

      // emitter.emit('ticket:updated', t)
      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_STATUS_UPDATE, {
        tid: ticket._id,
        owner: ticket.owner,
        status: ticket.status,
      });
    } catch (e) {
      winston.debug(e);
      winston.log('info', 'Error in Status' + JSON.stringify(e));
    }
  });
};

events.onUpdateTicket = function (socket) {
  socket.on(socketEvents.TICKETS_UPDATE, async (data) => {
    try {
      const ticket = await ticketSchema.getTicketById(data._id);

      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UPDATE, ticket);
    } catch (error) {
      // Blank
    }
  });
};

events.onUpdateAssigneeList = function (socket) {
  socket.on(socketEvents.TICKETS_ASSIGNEE_LOAD, function () {
    roleSchema.getAgentRoles(function (err, roles) {
      if (err) return true;
      userSchema.find({ role: { $in: roles }, deleted: false }, function (err, users) {
        if (err) return true;

        var sortedUser = _.sortBy(users, 'fullname');

        utils.sendToSelf(socket, socketEvents.TICKETS_ASSIGNEE_LOAD, sortedUser);
      });
    });
  });
};

events.onSetAssignee = function (socket) {
  socket.on(socketEvents.TICKETS_ASSIGNEE_SET, function (data) {
    var userId = data._id;
    var ownerId = socket.request.user._id;
    var ticketId = data.ticketId;
    ticketSchema.getTicketById(ticketId, function (err, ticket) {
      if (err) return true;

      async.parallel(
        {
          setAssignee: function (callback) {
            ticket.setAssignee(ownerId, userId, function (err, ticket) {
              callback(err, ticket);
            });
          },
          subscriber: function (callback) {
            ticket.addSubscriber(userId, function (err, ticket) {
              callback(err, ticket);
            });
          },
          user: function (callback) {
            ticket.addUsers(userId, function (err, ticket) {
              callback(err, ticket);
            });
          },
        },
        function (err, results) {
          if (err) return true;

          ticket = results.subscriber;
          ticket.save(function (err, ticket) {
            if (err) return true;
            ticket.populate('assignee', function (err, ticket) {
              if (err) return true;

              // ticketSchema.getTicketById(ticket.parent, function (err, parentTicket) {
              //   if (err) return true;
              //   parentTicket.addSubscriber(userId, function (err, ticket) {
              //     if (err) return true;
              //   });
              //   parentTicket.addUsers(userId, function (err, ticket) {
              //     if (err) return true;
              //   });
              //   parentTicket.save(function (err, ticket) {
              //     if (err) return true;
              //   });
              // });

              emitter.emit('ticket:subscriber:update', {
                user: userId,
                subscribe: true,
              });

              emitter.emit(socketEvents.TICKETS_ASSIGNEE_SET, {
                assigneeId: ticket.assignee._id,
                ticketId: ticket._id,
                ticketUid: ticket.uid,
                hostname: socket.handshake.headers.host,
              });

              // emitter.emit('ticket:updated', ticket)
              utils.sendToAllConnectedClients(io, socketEvents.TICKETS_ASSIGNEE_UPDATE, ticket);
            });
          });
        }
      );
    });
  });
};

events.onSetTicketType = function (socket) {
  socket.on(socketEvents.TICKETS_TYPE_SET, function (data) {
    const ticketId = data._id;
    const typeId = data.value;
    const ownerId = socket.request.user._id;

    if (_.isUndefined(ticketId) || _.isUndefined(typeId)) return true;
    ticketSchema.getTicketById(ticketId, function (err, ticket) {
      if (err) return true;
      ticket.setTicketType(ownerId, typeId, function (err, t) {
        if (err) return true;

        t.save(function (err, tt) {
          if (err) return true;

          ticketSchema.populate(tt, 'type', function (err) {
            if (err) return true;

            // emitter.emit('ticket:updated', tt)
            utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_TYPE_UPDATE, tt);
          });
        });
      });
    });
  });
};

events.onUpdateTicketTags = (socket) => {
  socket.on(socketEvents.TICKETS_UI_TAGS_UPDATE, async (data) => {
    const ticketId = data.ticketId;
    if (_.isUndefined(ticketId)) return true;

    try {
      const ticket = await ticketSchema.findOne({ _id: ticketId }).populate('tags');

      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_TAGS_UPDATE, ticket);
    } catch (e) {
      // Blank
    }
  });
};

events.onSetTicketPriority = function (socket) {
  socket.on(socketEvents.TICKETS_PRIORITY_SET, function (data) {
    const ticketId = data._id;
    const priority = data.value;
    const ownerId = socket.request.user._id;

    if (_.isUndefined(ticketId) || _.isUndefined(priority)) return true;
    ticketSchema.getTicketById(ticketId, function (err, ticket) {
      if (err) return true;
      prioritySchema.getPriority(priority, function (err, p) {
        if (err) {
          winston.debug(err);
          return true;
        }

        ticket.setTicketPriority(ownerId, p, function (err, t) {
          if (err) return true;
          t.save(function (err, tt) {
            if (err) return true;

            // emitter.emit('ticket:updated', tt)
            utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_PRIORITY_UPDATE, tt);
          });
        });
      });
    });
  });
};

events.onClearAssignee = (socket) => {
  socket.on(socketEvents.TICKETS_ASSIGNEE_CLEAR, async (id) => {
    const ownerId = socket.request.user._id;

    try {
      const ticket = await ticketSchema.findOne({ _id: id });
      const updatedTicket = await ticket.clearAssignee(ownerId);
      const savedTicket = await updatedTicket.save();

      // emitter.emit('ticket:updated', tt)
      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_ASSIGNEE_UPDATE, savedTicket);
    } catch (e) {
      // Blank
    }
  });
};

events.onSetTicketGroup = function (socket) {
  socket.on(socketEvents.TICKETS_GROUP_SET, function (data) {
    const ticketId = data._id;
    const groupId = data.value;
    const ownerId = socket.request.user._id;

    if (_.isUndefined(ticketId) || _.isUndefined(groupId)) return true;

    ticketSchema.getTicketById(ticketId, function (err, ticket) {
      if (err) return true;

      ticket.setTicketGroup(ownerId, groupId, function (err, t) {
        if (err) return true;

        t.save(function (err, tt) {
          if (err) return true;

          ticketSchema.populate(tt, 'group', function (err) {
            if (err) return true;

            // emitter.emit('ticket:updated', tt)
            utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_GROUP_UPDATE, tt);
          });
        });
      });
    });
  });
};

events.onSetTicketTeam = function (socket) {
  socket.on(socketEvents.TICKETS_TEAM_SET, function (data) {
    const ticketId = data._id;
    const teamId = data.value;
    const ownerId = socket.request.user._id;

    if (_.isUndefined(ticketId) || _.isUndefined(teamId)) return true;

    ticketSchema.getTicketById(ticketId, function (err, ticket) {
      if (err) return true;

      ticket.setTicketTeam(ownerId, teamId, function (err, t) {
        if (err) return true;

        t.save(function (err, tt) {
          if (err) return true;

          ticketSchema.populate(tt, 'team', function (err) {
            if (err) return true;

            // emitter.emit('ticket:updated', tt)
            utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_TEAM_UPDATE, tt);
          });
        });
      });
    });
  });
};

events.onSetTicketDueDate = function (socket) {
  socket.on(socketEvents.TICKETS_DUEDATE_SET, function (data) {
    const ticketId = data._id;
    const dueDate = data.value;
    const ownerId = socket.request.user._id;

    if (_.isUndefined(ticketId)) return true;

    ticketSchema.getTicketById(ticketId, function (err, ticket) {
      if (err) return true;

      ticket.setTicketDueDate(ownerId, dueDate, function (err, t) {
        if (err) return true;

        t.save(function (err, tt) {
          if (err) return true;

          // emitter.emit('ticket:updated', tt)
          utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_DUEDATE_UPDATE, tt);
        });
      });
    });
  });
};

events.onSetTicketIssue = (socket) => {
  socket.on(socketEvents.TICKETS_ISSUE_SET, async (data) => {
    const ticketId = data._id;
    let issue = data.value;
    const subject = data.subject;
    const module = data.module;
    const universityName = data.universityName;
    const verdict = data.verdict;
    const wordCount = data.wordCount || 0;
    const marks = data.marks || 0;
    let invoiceAmount = data.invoiceAmount || 0;
    const workCategory = data.workCategory;
    const currency = data.currency;

    const ownerId = socket.request.user._id;
    if (_.isUndefined(ticketId) || _.isUndefined(issue)) return true;

    try {
      let ticket = await ticketSchema.getTicketById(ticketId);

      if (subject && subject !== ticket.subject) ticket = await ticket.setSubject(ownerId, subject);
      if (issue && !_.isEqual(issue, ticket.issue)) ticket = await ticket.setIssue(ownerId, issue);
      if (module && module !== ticket.module) ticket = await ticket.setModule(ownerId, module);
      if (universityName && universityName !== ticket.universityName)
        ticket = await ticket.setUniversityName(ownerId, universityName);
      if (verdict && verdict !== ticket.verdict) ticket = await ticket.setVerdict(ownerId, verdict);
      if (wordCount !== 0 && wordCount !== ticket.wordCount) ticket = await ticket.setWordCount(ownerId, wordCount);
      if (marks !== 0 && marks !== ticket.marks) ticket = await ticket.setMarks(ownerId, marks);
      if (!_.isEmpty(currency) && currency !== ticket.currency) ticket = await ticket.setCurrency(ownerId, currency);
      if (invoiceAmount !== 0 && invoiceAmount !== ticket.invoiceAmount)
        ticket = await ticket.setInvoiceAmount(ownerId, (invoiceAmount = 0));
      if (!_.isEmpty(workCategory) && workCategory !== ticket.workCategory)
        ticket = await ticket.setWorkCategory(ownerId, workCategory);

      ticket = await ticket.save();

      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UPDATE, ticket);
    } catch (e) {
      // Blank
      winston.error(e);
    }
  });
};

events.onCommentNoteSet = (socket) => {
  socket.on(socketEvents.TICKETS_COMMENT_NOTE_SET, async (data) => {
    const ownerId = socket.request.user._id;
    const ticketId = data._id;
    const itemId = data.item;
    let text = data.value;
    const isNote = data.isNote;
    const isQuery = data.isQuery;

    if (_.isUndefined(ticketId) || _.isUndefined(itemId) || _.isUndefined(text)) return true;

    marked.setOptions({
      breaks: true,
    });

    text = sanitizeHtml(text).trim();
    const markedText = xss(marked.parse(text));

    try {
      let ticket = await ticketSchema.getTicketById(ticketId);
      if (isNote) ticket = await ticket.updateNote(ownerId, itemId, markedText);
      else if (isQuery) ticket = await ticket.updateQuery(ownerId, itemId, markedText);
      else ticket = await ticket.updateComment(ownerId, itemId, markedText);
      ticket = await ticket.save();

      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UPDATE, ticket);
    } catch (e) {
      winston.error(e);
    }
  });
};

events.onRemoveCommentNote = (socket) => {
  socket.on(socketEvents.TICKETS_COMMENT_NOTE_REMOVE, async (data) => {
    const ownerId = socket.request.user._id;
    const ticketId = data._id;
    const itemId = data.value;
    const isNote = data.isNote;
    const isQuery = data.isQuery;

    try {
      let ticket = await ticketSchema.getTicketById(ticketId);
      if (isNote) ticket = await ticket.removeNote(ownerId, itemId);
      else if (isQuery) {
      } //TODO
      else ticket = await ticket.removeNote(ownerId, itemId);

      ticket = await ticket.save();

      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UPDATE, ticket);
    } catch (e) {
      // Blank
      winston.error(e);
    }
  });
};

events.onAttachmentsUIUpdate = (socket) => {
  socket.on(socketEvents.TICKETS_UI_ATTACHMENTS_UPDATE, async (data) => {
    const ticketId = data._id;

    if (_.isUndefined(ticketId)) return true;

    try {
      const ticket = await ticketSchema.getTicketById(ticketId);
      const user = socket.request.user;
      if (_.isUndefined(user)) return true;

      const canRemoveAttachments = permissions.canThis(user.role, 'tickets:removeAttachment');

      const data = {
        ticket,
        canRemoveAttachments,
      };

      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UI_ATTACHMENTS_UPDATE, data);
    } catch (e) {
      // Blank
    }
  });
};

/**
 * NF: Get team members list
 * @param {*} socket
 */
events.onUpdateTeamAssigneeList = function (socket) {
  socket.on(socketEvents.TICKETS_ASSIGNEE_TEAM_LOAD, function (teamId, role, ticketType) {
    teamSchema.getAgentsOfTeamUnderRole(teamId, role, ticketType, function (err, users) {
      if (err) return true;

      var sortedUser = _.sortBy(users, 'fullname');

      utils.sendToSelf(socket, socketEvents.TICKETS_ASSIGNEE_TEAM_LOAD, sortedUser);
    });
  });
};

events.onCommentQueryMarkAsResolved = (socket) => {
  socket.on(socketEvents.TICKETS_MARK_QUERY_AS_RESOLVED, async (data) => {
    const ownerId = socket.request.user._id;
    const ticketId = data._id;
    const queryId = data.value;

    if (_.isUndefined(queryId) || _.isUndefined(ticketId)) return true;

    try {
      let ticket = await ticketSchema.getTicketById(ticketId);
      ticket = await ticket.setQueryAsResolved(ownerId, queryId);
      ticket = await ticket.save();

      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_UPDATE, ticket);
    } catch (e) {
      winston.error(e);
    }
  });
};

/**
 * NF: Get Group teams
 * @param {*} socket
 */
events.onUpdateGroupTeamList = function (socket) {
  socket.on(socketEvents.TICKETS_GROUP_TEAM_LOAD, function (data) {
    const groupId = data.value;
    DepartmentSchema.getDepartmentTeamsByGroup(groupId, function (err, results) {
      if (err) return true;
      const teams = [];
      results.forEach((result) => {
        result.teams.forEach((team) => {
          if (!teams.includes(team)) teams.push({ _id: team._id, name: team.name });
        });
      });
      utils.sendToSelf(socket, socketEvents.TICKETS_GROUP_TEAM_LOAD, teams);
    });
  });
};

events.onClearTeam = (socket) => {
  socket.on(socketEvents.TICKETS_TEAM_CLEAR, async (id) => {
    const ownerId = socket.request.user._id;

    try {
      const ticket = await ticketSchema.findOne({ _id: id });
      let updatedTicket = await ticket.clearTeam(ownerId);
      updatedTicket = await ticket.clearAssignee(ownerId);
      const savedTicket = await updatedTicket.save();

      // emitter.emit('ticket:updated', tt)
      utils.sendToAllConnectedClients(io, socketEvents.TICKETS_ASSIGNEE_UPDATE, savedTicket);
    } catch (e) {
      // Blank
    }
  });
};

module.exports = {
  events: events,
  eventLoop: eventLoop,
  register: register,
};
