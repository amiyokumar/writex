/*
 *
 */

import React, { Fragment, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { observable, computed, makeObservable } from 'mobx';
import { observer } from 'mobx-react';
import sortBy from 'lodash/sortBy';
import union from 'lodash/union';

import { transferToThirdParty, fetchTicketTypes, fetchTicketStatus } from 'actions/tickets';
import { fetchGroups, unloadGroups } from 'actions/groups';
import { showModal, hideModal } from 'actions/common';
import { fetchTeams, unloadTeams } from 'actions/teams';

import {
  TICKETS_UPDATE,
  TICKETS_UI_GROUP_UPDATE,
  TICKETS_GROUP_SET,
  TICKETS_UI_TYPE_UPDATE,
  TICKETS_TYPE_SET,
  TICKETS_UI_PRIORITY_UPDATE,
  TICKETS_PRIORITY_SET,
  TICKETS_ASSIGNEE_LOAD,
  TICKETS_ASSIGNEE_UPDATE,
  TICKETS_UI_DUEDATE_UPDATE,
  TICKETS_DUEDATE_SET,
  TICKETS_UI_TAGS_UPDATE,
  TICKETS_COMMENT_NOTE_REMOVE,
  TICKETS_COMMENT_NOTE_SET,
  TICKETS_TEAM_SET,
  TICKETS_UI_TEAM_UPDATE,
  TICKETS_ASSIGNEE_TEAM_LOAD,
  TICKETS_ISSUE_SET,
  TICKETS_MARK_QUERY_AS_RESOLVED,
  TICKETS_GROUP_TEAM_LOAD,
  TICKETS_ASSIGNEE_CLEAR,
  TICKETS_TEAM_CLEAR,
} from 'serverSocket/socketEventConsts';

import AssigneeDropdownPartial from 'containers/Tickets/AssigneeDropdownPartial';
import Avatar from 'components/Avatar/Avatar';
import CommentNotePartial from 'containers/Tickets/CommentNotePartial';
import DatePicker from 'components/DatePicker';
import EasyMDE from 'components/EasyMDE';
import IssuePartial from 'containers/Tickets/IssuePartial';
import OffCanvasEditor from 'components/OffCanvasEditor';
import PDropdownTrigger from 'components/PDropdown/PDropdownTrigger';
import StatusSelector from 'containers/Tickets/StatusSelector';
import TruTabSection from 'components/TruTabs/TruTabSection';
import TruTabSelector from 'components/TruTabs/TruTabSelector';
import TruTabSelectors from 'components/TruTabs/TruTabSelectors';
import TruTabWrapper from 'components/TruTabs/TruTabWrapper';

import axios from 'axios';
import helpers from 'lib/helpers';
import Log from '../../logger';
import UIkit from 'uikit';
import moment from 'moment';
import SpinLoader from 'components/SpinLoader';

const fetchTicket = (parent) => {
  axios
    .get(`/api/v2/tickets/${parent.props.ticketUid}`)
    .then((res) => {
      // setTimeout(() => {
      parent.ticket = res.data.ticket;
      parent.isSubscribed =
        parent.ticket &&
        parent.ticket.subscribers.findIndex((i) => i._id === parent.props.shared.sessionUser._id) !== -1;
      // }, 3000)
    })
    .catch((error) => {
      if (error.response.status === 403) {
        History.pushState(null, null, '/tickets');
      }
      Log.error(error);
    });
};

const fetchChildTickets = (parent) => {
  axios
    .get(`/api/v2/childtickets/${parent.props.ticketId}`)
    .then((res) => {
      parent.childTickets = res.data.tickets;
    })
    .catch((error) => {
      Log.error(error);
    });
};

const fetchGroupTeams = (parent) => {
  axios
    .get(`/api/v2/teams/${parent.props.groupId}`)
    .then((res) => {
      parent.groupTeams = res.data.teams;
    })
    .catch((error) => {
      Log.error(error);
    });
};

const showPriorityConfirm = () => {
  UIkit.modal.confirm(
    'Selected Priority does not exist for this ticket type. Priority has reset to the default for this type.' +
      '<br><br><strong>Please select a new priority</strong>',
    () => {},
    { cancelButtonClass: 'uk-hidden' }
  );
};

@observer
class SingleTicketContainer extends React.Component {
  @observable ticket = null;
  @observable isSubscribed = false;
  assigneeDropdownPartial = createRef();

  constructor(props) {
    super(props);
    makeObservable(this);

    this.onUpdateTicket = this.onUpdateTicket.bind(this);
    this.onSocketUpdateComments = this.onSocketUpdateComments.bind(this);
    this.onUpdateTicketNotes = this.onUpdateTicketNotes.bind(this);
    this.onUpdateAssignee = this.onUpdateAssignee.bind(this);
    this.onUpdateTicketType = this.onUpdateTicketType.bind(this);
    this.onUpdateTicketPriority = this.onUpdateTicketPriority.bind(this);
    this.onUpdateTicketGroup = this.onUpdateTicketGroup.bind(this);
    this.onUpdateTicketDueDate = this.onUpdateTicketDueDate.bind(this);
    this.onUpdateTicketTags = this.onUpdateTicketTags.bind(this);
    this.onUpdateTicketTeam = this.onUpdateTicketTeam.bind(this);
    this.onTicketGroupUpdateRefreshTeamList = this.onTicketGroupUpdateRefreshTeamList.bind(this);
  }

  @computed
  get notesTagged() {
    this.ticket.notes.forEach((i) => (i.isNote = true));

    return this.ticket.notes;
  }

  @computed
  get queriesTagged() {
    this.ticket.queries.forEach((i) => (i.isQuery = true));

    return this.ticket.queries;
  }

  @computed get commentsAndNotesAndQueries() {
    if (!this.ticket) return [];
    if (!helpers.canUser('tickets:notes', true)) {
      return sortBy(this.ticket.comments, 'date');
    }

    let commentsAndNotesAndQueries = union(this.ticket.comments, this.notesTagged, this.queriesTagged);
    commentsAndNotesAndQueries = sortBy(commentsAndNotesAndQueries, 'date');

    return commentsAndNotesAndQueries;
  }

  @computed get hasCommentsOrNotes() {
    if (!this.ticket) return false;
    return this.ticket.comments.length > 0 || this.ticket.notes.length > 0 || this.ticket.queries.length > 0;
  }

  componentDidMount() {
    this.props.socket.on(TICKETS_UPDATE, this.onUpdateTicket);
    this.props.socket.on(TICKETS_ASSIGNEE_UPDATE, this.onUpdateAssignee);
    this.props.socket.on(TICKETS_UI_TYPE_UPDATE, this.onUpdateTicketType);
    this.props.socket.on(TICKETS_UI_PRIORITY_UPDATE, this.onUpdateTicketPriority);
    this.props.socket.on(TICKETS_UI_GROUP_UPDATE, this.onUpdateTicketGroup);
    this.props.socket.on(TICKETS_UI_DUEDATE_UPDATE, this.onUpdateTicketDueDate);
    this.props.socket.on(TICKETS_UI_TAGS_UPDATE, this.onUpdateTicketTags);
    this.props.socket.on(TICKETS_UI_TEAM_UPDATE, this.onUpdateTicketTeam);
    this.props.socket.on(TICKETS_GROUP_TEAM_LOAD, this.onTicketGroupUpdateRefreshTeamList);

    fetchTicket(this);
    this.props.fetchTicketTypes();
    this.props.fetchGroups();
    this.props.fetchTicketStatus();
    // this.props.fetchTeams();
    fetchChildTickets(this);
    fetchGroupTeams(this);
  }

  componentDidUpdate() {
    helpers.resizeFullHeight();
    helpers.setupScrollers();
  }

  componentWillUnmount() {
    this.props.socket.off(TICKETS_UPDATE, this.onUpdateTicket);
    this.props.socket.off(TICKETS_ASSIGNEE_UPDATE, this.onUpdateAssignee);
    this.props.socket.off(TICKETS_UI_TYPE_UPDATE, this.onUpdateTicketType);
    this.props.socket.off(TICKETS_UI_PRIORITY_UPDATE, this.onUpdateTicketPriority);
    this.props.socket.off(TICKETS_UI_GROUP_UPDATE, this.onUpdateTicketGroup);
    this.props.socket.off(TICKETS_UI_DUEDATE_UPDATE, this.onUpdateTicketDueDate);
    this.props.socket.off(TICKETS_UI_TAGS_UPDATE, this.onUpdateTicketTags);
    this.props.socket.off(TICKETS_UI_TEAM_UPDATE, this.onUpdateTicketTeam);
    this.props.socket.off(TICKETS_GROUP_TEAM_LOAD, this.onTicketGroupUpdateRefreshTeamList);

    this.props.unloadGroups();
    this.props.unloadTeams();
  }

  onUpdateTicket(data) {
    if (this.ticket._id === data._id) {
      this.ticket = data;
    }
  }

  onSocketUpdateComments(data) {
    if (this.ticket._id === data._id) this.ticket.comments = data.comments;
  }

  onUpdateTicketNotes(data) {
    if (this.ticket._id === data._id) this.ticket.notes = data.notes;
  }

  onUpdateAssignee(data) {
    if (this.ticket._id === data._id) {
      this.ticket.assignee = data.assignee;
      if (this.ticket.assignee && this.ticket.assignee._id === this.props.shared.sessionUser._id)
        this.isSubscribed = true;
    }
  }

  onUpdateTicketType(data) {
    if (this.ticket._id === data._id) this.ticket.type = data.type;
  }

  onUpdateTicketPriority(data) {
    if (this.ticket._id === data._id) this.ticket.priority = data.priority;
  }

  onUpdateTicketGroup(data) {
    if (this.ticket._id === data._id) {
      this.ticket.group = data.group;
      this.ticket.team = undefined;
      this.ticket.assignee = undefined;
      this.props.socket.emit(TICKETS_TEAM_CLEAR, this.ticket._id);
    }
  }
  onTicketGroupUpdateRefreshTeamList(data) {
    this.groupTeams = data;
  }

  onUpdateTicketTeam(data) {
    if (this.ticket._id === data._id) this.ticket.team = data.team;
    this.ticket.assignee = undefined;
    this.props.socket.emit(TICKETS_ASSIGNEE_CLEAR, this.ticket._id);
  }

  onUpdateTicketDueDate(data) {
    if (this.ticket._id === data._id) this.ticket.dueDate = data.dueDate;
  }

  onUpdateTicketTags(data) {
    if (this.ticket._id === data._id) this.ticket.tags = data.tags;
  }

  onCommentNoteSubmit(e, type) {
    e.preventDefault();
    let isNote = false,
      isComment = false,
      isQuery = false;
    switch (type) {
      case 'note':
        isNote = true;
        break;
      case 'comment':
        isComment = true;
        break;
      case 'query':
        isQuery = true;
        break;
      default:
        break;
    }
    axios
      .post(`/api/v1/tickets/add${type}`, {
        _id: this.ticket._id,
        ticketid: this.ticket._id,
        comment: isComment && this.commentMDE.getEditorText(),
        note: isNote && this.noteMDE.getEditorText(),
        query: isQuery && this.queryMDE.getEditorText(),
      })
      .then((res) => {
        if (res && res.data && res.data.success) {
          if (isNote) {
            this.ticket.notes = res.data.ticket.notes;
            this.noteMDE.setEditorText('');
          } else if (isComment) {
            this.ticket.comments = res.data.ticket.comments;
            this.commentMDE.setEditorText('');
          } else {
            this.ticket.queries = res.data.ticket.queries;
            this.queryMDE.setEditorText('');
          }

          helpers.scrollToBottom('.page-content-right', true);
          this.ticket.history = res.data.ticket.history;
        }
      })
      .catch((error) => {
        Log.error(error);
        if (error.response) Log.error(error.response);
        helpers.UI.showSnackbar(error, true);
      });
  }

  onSubscriberChanged(e) {
    axios
      .put(`/api/v1/tickets/${this.ticket._id}/subscribe`, {
        user: this.props.shared.sessionUser._id,
        subscribe: e.target.checked,
      })
      .then((res) => {
        if (res.data.success && res.data.ticket) {
          this.ticket.subscribers = res.data.ticket.subscribers;
          this.isSubscribed =
            this.ticket.subscribers.findIndex((i) => i._id === this.props.shared.sessionUser._id) !== -1;
        }
      })
      .catch((error) => {
        Log.error(error.response || error);
      });
  }

  transferToThirdParty(e) {
    this.props.transferToThirdParty({ uid: this.ticket.uid });
  }

  render() {
    const mappedGroups = this.props.groupsState
      ? this.props.groupsState.groups.map((group) => {
          return { text: group.get('name'), value: group.get('_id') };
        })
      : [];

    const mappedTeams = this.groupTeams
      ? this.groupTeams.map((team) => {
          return { text: team.name, value: team._id };
        })
      : [{}];

    const mappedTypes = this.props.ticketTypes
      ? this.props.ticketTypes.map((type) => {
          return { text: type.get('name'), value: type.get('_id'), raw: type.toJS() };
        })
      : [];

    // Perms
    const hasTicketUpdate = this.ticket && this.ticket.status.isResolved === false && helpers.canUser('tickets:update');
    const statusObj = this.ticket
      ? this.props.ticketStatuses.find((s) => s.get('_id') === this.ticket.status._id)
      : null;

    const hasTicketStatusUpdate = () => {
      const isAgent = this.props.sessionUser ? this.props.sessionUser.role.isAgent : false;
      const isAdmin = this.props.sessionUser ? this.props.sessionUser.role.isAdmin : false;
      if (isAgent || isAdmin) {
        return helpers.canUser('tickets:update');
      } else {
        if (!this.ticket || !this.props.sessionUser) return false;
        return helpers.hasPermOverRole(this.ticket.owner.role, this.props.sessionUser.role, 'tickets:update', false);
      }
    };
    let filteredChildTickets = [];
    if (this.props.sessionUser?.role.normalized === 'pm' && this.childTickets) {
      filteredChildTickets = [...this.childTickets];
    } else if (['tm', 'tl'].includes(this.props.sessionUser?.role.normalized) && this.childTickets) {
      filteredChildTickets = this.childTickets.filter((childTicket) =>
        ['dev', 'quality'].includes(childTicket.type.name?.toLowerCase())
      );
    }
    const childTicketsComp = filteredChildTickets.map((childTicket) => {
      return (
        <a
          key={childTicket}
          style={{ fontSize: '13px', padding: '4px' }}
          onClick={() => History.pushState(null, null, `/tickets/${childTicket.uid}`)}
        >
          {childTicket.ticketID}
        </a>
      );
    });

    return (
      <div className={'uk-clearfix uk-position-relative'} style={{ width: '100%', height: '100vh' }}>
        {!this.ticket && <SpinLoader active={true} />}
        {this.ticket && (
          <Fragment>
            <div className={'page-content'}>
              <div
                className="uk-float-left page-title page-title-small noshadow nopadding relative"
                style={{ width: 360, maxWidth: 360, minWidth: 360 }}
              >
                <div className="page-title-border-right relative" style={{ padding: '0 30px' }}>
                  <p>{this.ticket.ticketID}</p>
                  <StatusSelector
                    ticketId={this.ticket._id}
                    status={this.ticket.status._id}
                    socket={this.props.socket}
                    onStatusChange={(status) => {
                      this.ticket.status = status;
                    }}
                    hasPerm={hasTicketStatusUpdate()}
                    ticketType={this.ticket.type.name}
                    parentId={this.ticket.parent ? this.ticket.parent._id : null}
                  />
                </div>
                {filteredChildTickets.length > 0 && <div style={{ padding: '0 30px' }}>{childTicketsComp}</div>}

                {this.ticket.parent && ['PM', 'TM', 'TL'].includes(this.props.shared.sessionUser?.role.name) && (
                  <div style={{ padding: '0 30px' }}>
                    <a
                      style={{ fontSize: '13px', padding: '4px' }}
                      onClick={() => History.pushState(null, null, `/tickets/${this.ticket.parent.uid}`)}
                    >
                      {this.ticket.parent.ticketID}
                    </a>
                  </div>
                )}

                {/* Start Create Ticket Perm */}
                {this.ticket.parent &&
                  this.props.shared.sessionUser &&
                  helpers.canUser('tickets:create') &&
                  ['TM', 'TL'].includes(this.props.shared.sessionUser?.role.name) && (
                    <div style={{ padding: '0 30px', textAlign: 'center', marginBottom: '4px' }}>
                      <button
                        className="uk-button uk-button-accent"
                        style={{ padding: '10px 15px' }}
                        onClick={() =>
                          this.props.showModal('CREATE_CHILD_TICKET', {
                            parentId: this.ticket.parent._id,
                            parentUid: this.ticket.parent.uid,
                            ticketID: this.ticket.ticketID,
                            parentTicketID: this.ticket.parent.ticketID,
                          })
                        }
                      >
                        Create more ticket
                      </button>
                    </div>
                  )}

                {/*  Left Side */}
                <div className="page-content-left full-height scrollable">
                  <div className="ticket-details-wrap uk-position-relative uk-clearfix">
                    <div className="ticket-assignee-wrap uk-clearfix" style={{ paddingRight: 30 }}>
                      <h4>Assignee</h4>
                      <div className="ticket-assignee uk-clearfix">
                        {hasTicketUpdate && (
                          <a
                            role="button"
                            title="Set Assignee"
                            style={{ float: 'left' }}
                            className="relative no-ajaxy"
                            onClick={() =>
                              this.props.socket.emit(
                                TICKETS_ASSIGNEE_TEAM_LOAD,
                                this.ticket.team ? this.ticket.team._id : null,
                                this.props.shared.sessionUser.role.normalized,
                                this.ticket.type.name
                              )
                            }
                          >
                            <PDropdownTrigger target={this.assigneeDropdownPartial}>
                              <Avatar
                                image={this.ticket.assignee && this.ticket.assignee.image}
                                showOnlineBubble={this.ticket.assignee !== undefined}
                                userId={this.ticket.assignee && this.ticket.assignee._id}
                              />
                              <span className="drop-icon material-icons">keyboard_arrow_down</span>
                            </PDropdownTrigger>
                          </a>
                        )}
                        {!hasTicketUpdate && (
                          <Avatar
                            image={this.ticket.assignee && this.ticket.assignee.image}
                            showOnlineBubble={this.ticket.assignee !== undefined}
                            userId={this.ticket.assignee && this.ticket.assignee._id}
                          />
                        )}
                        <div className="ticket-assignee-details">
                          {!this.ticket.assignee && <h3>No User Assigned</h3>}
                          {this.ticket.assignee && (
                            <Fragment>
                              <h3>{this.ticket.assignee.fullname}</h3>
                              <a
                                className="comment-email-link uk-text-truncate uk-display-inline-block"
                                href={`mailto:${this.ticket.assignee.email}`}
                              >
                                {this.ticket.assignee.email}
                              </a>
                              <span className={'uk-display-block'}>{this.ticket.assignee.title}</span>
                            </Fragment>
                          )}
                        </div>
                      </div>

                      {hasTicketUpdate && (
                        <AssigneeDropdownPartial
                          forwardedRef={this.assigneeDropdownPartial}
                          ticketId={this.ticket._id}
                          onClearClick={() => (this.ticket.assignee = undefined)}
                          onAssigneeClick={({ agent }) => (this.ticket.assignee = agent)}
                        />
                      )}
                    </div>

                    <div className="uk-width-1-1 padding-left-right-15">
                      <div className="tru-card ticket-details uk-clearfix">
                        {/* Type */}
                        <div className="uk-width-1-2 uk-float-left nopadding">
                          <div className="marginright5">
                            <span>Type</span>
                            {hasTicketUpdate && (
                              <select
                                value={this.ticket.type._id}
                                onChange={(e) => {
                                  const type = this.props.ticketTypes.find((t) => t.get('_id') === e.target.value);

                                  const priority = type
                                    .get('priorities')
                                    .findIndex((p) => p.get('_id') === this.ticket.priority._id);

                                  const hasPriority = priority !== -1;

                                  if (!hasPriority) {
                                    this.props.socket.emit(TICKETS_PRIORITY_SET, {
                                      _id: this.ticket._id,
                                      value: type.get('priorities').find(() => true),
                                    });

                                    showPriorityConfirm();
                                  }

                                  this.props.socket.emit(TICKETS_TYPE_SET, {
                                    _id: this.ticket._id,
                                    value: e.target.value,
                                  });
                                }}
                              >
                                {mappedTypes &&
                                  mappedTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.text}
                                    </option>
                                  ))}
                              </select>
                            )}
                            {!hasTicketUpdate && <div className="input-box">{this.ticket.type.name}</div>}
                          </div>
                        </div>
                        {/* Priority */}
                        <div className="uk-width-1-2 uk-float-left nopadding">
                          <div className="marginleft5">
                            <span>Priority</span>
                            {hasTicketUpdate && (
                              <select
                                name="tPriority"
                                id="tPriority"
                                value={this.ticket.priority._id}
                                onChange={(e) =>
                                  this.props.socket.emit(TICKETS_PRIORITY_SET, {
                                    _id: this.ticket._id,
                                    value: e.target.value,
                                  })
                                }
                              >
                                {this.ticket.type &&
                                  this.ticket.type.priorities &&
                                  this.ticket.type.priorities.map((priority) => (
                                    <option key={priority._id} value={priority._id}>
                                      {priority.name}
                                    </option>
                                  ))}
                              </select>
                            )}
                            {!hasTicketUpdate && <div className={'input-box'}>{this.ticket.priority.name}</div>}
                          </div>
                        </div>
                        {/*  Group */}
                        <div className="uk-width-1-1 nopadding uk-clearfix">
                          <span>Group</span>
                          {hasTicketUpdate && (
                            <select
                              value={this.ticket.group._id}
                              onChange={(e) => {
                                this.props.socket.emit(TICKETS_GROUP_SET, {
                                  _id: this.ticket._id,
                                  value: e.target.value,
                                });
                                this.props.socket.emit(TICKETS_GROUP_TEAM_LOAD, {
                                  value: e.target.value,
                                });
                              }}
                            >
                              {mappedGroups &&
                                mappedGroups.map((group) => (
                                  <option key={group.value} value={group.value}>
                                    {group.text}
                                  </option>
                                ))}
                            </select>
                          )}
                          {!hasTicketUpdate && <div className={'input-box'}>{this.ticket.group.name}</div>}
                        </div>
                        {/*  Team */}
                        <div className="uk-width-1-1 nopadding uk-clearfix">
                          <span>Team</span>
                          {hasTicketUpdate && (
                            <select
                              value={this.ticket.team ? this.ticket.team._id : null}
                              onChange={(e) => {
                                this.props.socket.emit(TICKETS_TEAM_SET, {
                                  _id: this.ticket._id,
                                  value: e.target.value,
                                });
                              }}
                            >
                              <option key="teamSelect" value="">
                                Choose a team
                              </option>
                              {mappedTeams &&
                                mappedTeams.map((team) => (
                                  <option key={team.value} value={team.value}>
                                    {team.text}
                                  </option>
                                ))}
                            </select>
                          )}
                          {!hasTicketUpdate && <div className={'input-box'}>{this.ticket.team?.name}</div>}
                        </div>
                        {/*  Due Date */}
                        <div className="uk-width-1-1 p-0">
                          <span>Due Date</span> {hasTicketUpdate && <span>-&nbsp;</span>}
                          {hasTicketUpdate && (
                            <div className={'uk-display-inline'}>
                              <a
                                role={'button'}
                                onClick={(e) => {
                                  e.preventDefault();
                                  this.props.socket.emit(TICKETS_DUEDATE_SET, {
                                    _id: this.ticket._id,
                                    value: undefined,
                                  });
                                }}
                              >
                                Clear
                              </a>
                              <DatePicker
                                name={'ticket_due_date'}
                                format={helpers.getShortDateFormat()}
                                value={this.ticket.dueDate}
                                small={true}
                                onChange={(e) => {
                                  const dueDate = moment(e.target.value, helpers.getShortDateFormat())
                                    .utc()
                                    .toISOString();

                                  this.props.socket.emit(TICKETS_DUEDATE_SET, { _id: this.ticket._id, value: dueDate });
                                }}
                              />
                            </div>
                          )}
                          {!hasTicketUpdate && (
                            <div className="input-box">
                              {helpers.formatDate(this.ticket.dueDate, this.props.common.get('shortDateFormat'))}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="uk-width-1-1 nopadding">
                          <span>
                            Tags
                            {hasTicketUpdate && (
                              <Fragment>
                                <span> - </span>
                                <div id="editTags" className={'uk-display-inline'}>
                                  <a
                                    role={'button'}
                                    style={{ fontSize: 11 }}
                                    className="no-ajaxy"
                                    onClick={() => {
                                      this.props.showModal('ADD_TAGS_MODAL', {
                                        ticketId: this.ticket._id,
                                        currentTags: this.ticket.tags.map((tag) => tag._id),
                                      });
                                    }}
                                  >
                                    Edit Tags
                                  </a>
                                </div>
                              </Fragment>
                            )}
                          </span>
                          <div className="tag-list uk-clearfix">
                            {this.ticket.tags &&
                              this.ticket.tags.map((tag) => (
                                <div key={tag._id} className="item">
                                  {tag.name}
                                </div>
                              ))}
                          </div>
                        </div>
                        {/* Module Name */}
                        <div className="uk-width-1-1 nopadding">
                          <div id="editDetails" className={'uk-display-inline'}>
                            <a
                              role={'button'}
                              style={{ fontSize: 11 }}
                              className="no-ajaxy"
                              onClick={() => {
                                if (this.editorWindow)
                                  this.editorWindow.openEditorWindow({
                                    subject: this.ticket.subject,
                                    text: this.ticket.issue,
                                    module: this.ticket.module,
                                    universityName: this.ticket.universityName,
                                    verdict: this.ticket.verdict,
                                    wordCount: this.ticket.wordCount,
                                    marks: this.ticket.marks,
                                    currency: this.ticket.currency,
                                    invoiceAmount: this.ticket.invoiceAmount,
                                    workCategory: this.ticket.workCategory,
                                    ticketType: this.ticket.type?.name,
                                    onPrimaryClick: (data) => {
                                      this.props.socket.emit(TICKETS_ISSUE_SET, {
                                        _id: this.ticket._id,
                                        value: data.text,
                                        subject: data.subjectText,
                                        module: data.module,
                                        universityName: data.universityName,
                                        verdict: data.verdict,
                                        wordCount: data.wordCount,
                                        marks: data.marks,
                                        invoiceAmount: data.invoiceAmount,
                                        workCategory: data.workCategory,
                                        currency: data.currency,
                                      });
                                    },
                                  });
                              }}
                            >
                              Edit Ticket Details
                            </a>
                          </div>
                        </div>
                        <div className="uk-width-1-2 uk-float-left nopadding">
                          <div className="marginright5">
                            <span>Module</span>
                            <div className="input-box">{this.ticket.module}</div>
                          </div>
                        </div>
                        {/* University Name */}
                        <div className="uk-width-1-2 uk-float-left nopadding">
                          <div className="marginleft5">
                            <span>University</span>
                            <div className={'input-box'}>{this.ticket.universityName}</div>
                          </div>
                        </div>
                        {/* Work Category */}
                        <div className="uk-width-1-2 uk-float-left nopadding">
                          <div className="marginleft5">
                            <span>Work Category</span>
                            <div className={'input-box'}>{this.ticket.workCategory}</div>
                          </div>
                        </div>
                        {/* Word Count */}
                        <div className="uk-width-1-2 uk-float-left nopadding">
                          <div className="marginleft5">
                            <span>Word Count</span>
                            <div className={'input-box'}>{this.ticket.wordCount}</div>
                          </div>
                        </div>
                        {/* currency */}
                        {['pm', 'sales'].includes(this.props.shared.sessionUser.role.normalized) && (
                          <div>
                            <div className="uk-width-1-5 uk-float-left nopadding">
                              <div className="marginleft5">
                                <span>Currency</span>
                                <div className={'input-box'}>{this.ticket.currency}</div>
                              </div>
                            </div>
                            {/* Invoice Amount */}
                            <div className="uk-width-2-5 uk-float-left nopadding">
                              <div className="marginleft5">
                                <span>Amount</span>
                                <div className={'input-box'}>{this.ticket.invoiceAmount}</div>
                              </div>
                            </div>
                            {/* Invoice Number */}
                            <div className="uk-width-2-5 uk-float-left nopadding">
                              <div className="marginleft5">
                                <span>Invoice No</span>
                                <div className={'input-box'}>{this.ticket.invoiceNumber}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* marks */}
                        <div className="uk-width-1-2 uk-float-left nopadding">
                          <div className="marginleft5">
                            <span>Marks</span>
                            <div className={'input-box'}>{this.ticket.marks}</div>
                          </div>
                        </div>
                        {/* Verdict */}
                        {this.ticket.type.name === 'Sales' && (
                          <div className="uk-width-1-2 uk-float-left nopadding">
                            <div className="marginleft5">
                              <span>Verdict</span>
                              <div className={'input-box'}>{this.ticket.verdict}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {helpers.canUser('agent:*', true) && (
                      <div className="uk-width-1-1 padding-left-right-15">
                        <div className="tru-card ticket-details pr-0 pb-0" style={{ height: 250 }}>
                          Ticket History
                          <hr style={{ padding: 0, margin: 0 }} />
                          <div className="history-items scrollable" style={{ paddingTop: 12 }}>
                            {this.ticket.history &&
                              this.ticket.history.map((item) => (
                                <div key={item._id} className="history-item">
                                  <time
                                    dateTime={helpers.formatDate(item.date, this.props.common.get('longDateFormat'))}
                                  />
                                  <em>
                                    Action by: <span>{item.owner.fullname}</span>
                                  </em>
                                  <p>{item.description}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Right Side */}
              <div className="page-message nopadding" style={{ marginLeft: 360 }}>
                <div className="page-title-right noshadow">
                  {this.props.common.get('hasThirdParty') && (
                    <div className="page-top-comments uk-float-right">
                      <a
                        role="button"
                        className="btn md-btn-primary no-ajaxy"
                        onClick={(e) => {
                          e.preventDefault();
                          this.transferToThirdParty(e);
                        }}
                      >
                        Transfer to ThirdParty
                      </a>
                    </div>
                  )}
                  <div className="page-top-comments uk-float-right">
                    <a
                      role="button"
                      className="btn no-ajaxy"
                      onClick={(e) => {
                        e.preventDefault();
                        helpers.scrollToBottom('.page-content-right', true);
                      }}
                    >
                      Add Comment
                    </a>
                  </div>
                  <div
                    className="onoffswitch subscribeSwitch uk-float-right"
                    style={{ marginRight: 10, position: 'relative', top: 18 }}
                  >
                    <input
                      id={'subscribeSwitch'}
                      type="checkbox"
                      name="subscribeSwitch"
                      className="onoffswitch-checkbox"
                      checked={this.isSubscribed}
                      onChange={(e) => this.onSubscriberChanged(e)}
                    />
                    <label className="onoffswitch-label" htmlFor="subscribeSwitch">
                      <span className="onoffswitch-inner subscribeSwitch-inner" />
                      <span className="onoffswitch-switch subscribeSwitch-switch" />
                    </label>
                  </div>
                  <div className="pagination uk-float-right" style={{ marginRight: 5 }}>
                    <ul className="button-group">
                      {helpers.canUser('tickets:print') && (
                        <li className="pagination">
                          <a
                            href={`/tickets/print/${this.ticket.uid}`}
                            className="btn no-ajaxy"
                            style={{ borderRadius: 3, marginRight: 5 }}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <i className="material-icons">&#xE8AD;</i>
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="page-content-right full-height scrollable">
                  <div className="comments-wrapper">
                    <IssuePartial
                      ticketId={this.ticket._id}
                      status={statusObj}
                      owner={this.ticket.owner}
                      subject={this.ticket.subject}
                      issue={this.ticket.issue}
                      date={this.ticket.date}
                      dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get('timeFormat')}`}
                      attachments={this.ticket.attachments}
                      editorWindow={this.editorWindow}
                      socket={this.props.socket}
                      module={this.ticket.module}
                      universityName={this.ticket.universityName}
                      verdict={this.ticket.verdict}
                      wordCount={this.ticket.wordCount}
                      marks={this.ticket.marks}
                      invoiceAmount={this.ticket.invoiceAmount}
                      workCategory={this.ticket.workCategory}
                      currency={this.ticket.currency}
                      ticketType={this.ticket.type?.name}
                      ticketID={this.ticket.ticketID}
                    />

                    {/* Tabs */}
                    {this.hasCommentsOrNotes && (
                      <TruTabWrapper>
                        <TruTabSelectors style={{ marginLeft: 110 }}>
                          <TruTabSelector
                            selectorId={0}
                            label="All"
                            active={true}
                            showBadge={true}
                            badgeText={this.commentsAndNotesAndQueries.length}
                          />
                          <TruTabSelector
                            selectorId={1}
                            label="Comments"
                            showBadge={true}
                            badgeText={this.ticket ? this.ticket.comments && this.ticket.comments.length : 0}
                          />
                          <TruTabSelector
                            selectorId={2}
                            label="Queries"
                            showBadge={true}
                            badgeText={this.ticket ? this.ticket.queries && this.ticket.queries.length : 0}
                          />
                          {helpers.canUser('tickets:notes', true) && (
                            <TruTabSelector
                              selectorId={3}
                              label="Notes"
                              showBadge={true}
                              badgeText={this.ticket ? this.ticket.notes && this.ticket.notes.length : 0}
                            />
                          )}
                        </TruTabSelectors>

                        {/* Tab Sections */}
                        <TruTabSection sectionId={0} active={true}>
                          <div className="all-comments">
                            {this.commentsAndNotesAndQueries.map((item) => (
                              <CommentNotePartial
                                key={item._id}
                                ticketStatus={statusObj}
                                ticketSubject={this.ticket.subject}
                                comment={item}
                                isNote={item.isNote}
                                isQuery={item.isQuery}
                                dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get(
                                  'timeFormat'
                                )}`}
                                onEditClick={() => {
                                  this.editorWindow.openEditorWindow({
                                    showSubject: false,
                                    text:
                                      !item.isNote && !item.isQuery
                                        ? item.comment
                                        : item.isNote
                                        ? item.note
                                        : item.query,
                                    onPrimaryClick: (data) => {
                                      this.props.socket.emit(TICKETS_COMMENT_NOTE_SET, {
                                        _id: this.ticket._id,
                                        item: item._id,
                                        isNote: item.isNote,
                                        value: data.text,
                                        isQuery: item.isQuery,
                                      });
                                    },
                                  });
                                }}
                                onRemoveClick={() => {
                                  this.props.socket.emit(TICKETS_COMMENT_NOTE_REMOVE, {
                                    _id: this.ticket._id,
                                    value: item._id,
                                    isNote: item.isNote,
                                    isQuery: item.isQuery,
                                  });
                                }}
                                onMarkAsResolved={() => {
                                  this.props.socket.emit(TICKETS_MARK_QUERY_AS_RESOLVED, {
                                    _id: this.ticket._id,
                                    value: item._id,
                                    isNote: item.isNote,
                                    isQuery: item.isQuery,
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </TruTabSection>
                        <TruTabSection sectionId={1}>
                          <div className="comments">
                            {this.ticket &&
                              this.ticket.comments.map((comment) => (
                                <CommentNotePartial
                                  key={comment._id}
                                  ticketStatus={statusObj}
                                  ticketSubject={this.ticket.subject}
                                  comment={comment}
                                  dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get(
                                    'timeFormat'
                                  )}`}
                                  onEditClick={() => {
                                    this.editorWindow.openEditorWindow({
                                      showSubject: false,
                                      text: comment.comment,
                                      onPrimaryClick: (data) => {
                                        this.props.socket.emit(TICKETS_COMMENT_NOTE_SET, {
                                          _id: this.ticket._id,
                                          item: comment._id,
                                          isNote: comment.isNote,
                                          value: data.text,
                                          isQuery: comment.isQuery,
                                        });
                                      },
                                    });
                                  }}
                                  onRemoveClick={() => {
                                    this.props.socket.emit(TICKETS_COMMENT_NOTE_REMOVE, {
                                      _id: this.ticket._id,
                                      value: comment._id,
                                      isNote: comment.isNote,
                                    });
                                  }}
                                />
                              ))}
                          </div>
                        </TruTabSection>
                        <TruTabSection sectionId={2}>
                          <div className="queries">
                            {this.ticket &&
                              this.ticket.queries.map((query) => (
                                <CommentNotePartial
                                  key={query._id}
                                  ticketStatus={statusObj}
                                  ticketSubject={this.ticket.subject}
                                  comment={query}
                                  isQuery={true}
                                  isNote={query.isNote}
                                  dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get(
                                    'timeFormat'
                                  )}`}
                                  onEditClick={() => {
                                    this.editorWindow.openEditorWindow({
                                      showSubject: false,
                                      text: query.query,
                                      onPrimaryClick: (data) => {
                                        this.props.socket.emit(TICKETS_COMMENT_NOTE_SET, {
                                          _id: this.ticket._id,
                                          item: query._id,
                                          isNote: query.isNote,
                                          value: data.text,
                                          isQuery: query.isQuery,
                                        });
                                      },
                                    });
                                  }}
                                  onRemoveClick={() => {
                                    this.props.socket.emit(TICKETS_COMMENT_NOTE_REMOVE, {
                                      _id: this.ticket._id,
                                      value: query._id,
                                      isNote: query.isNote,
                                      isQuery: query.isQuery,
                                    });
                                  }}
                                  onMarkAsResolved={() => {
                                    this.props.socket.emit(TICKETS_MARK_QUERY_AS_RESOLVED, {
                                      _id: this.ticket._id,
                                      value: query._id,
                                      isQuery: query.isQuery,
                                    });
                                  }}
                                />
                              ))}
                          </div>
                        </TruTabSection>
                        <TruTabSection sectionId={3}>
                          <div className="notes">
                            {this.ticket &&
                              this.ticket.notes.map((note) => (
                                <CommentNotePartial
                                  key={note._id}
                                  ticketStatus={statusObj}
                                  ticketSubject={this.ticket.subject}
                                  comment={note}
                                  isNote={true}
                                  dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get(
                                    'timeFormat'
                                  )}`}
                                  onEditClick={() => {
                                    this.editorWindow.openEditorWindow({
                                      showSubject: false,
                                      text: note.note,
                                      onPrimaryClick: (data) => {
                                        this.props.socket.emit(TICKETS_COMMENT_NOTE_SET, {
                                          _id: this.ticket._id,
                                          item: note._id,
                                          isNote: note.isNote,
                                          value: data.text,
                                          isQuery: note.isQuery,
                                        });
                                      },
                                    });
                                  }}
                                  onRemoveClick={() => {
                                    this.props.socket.emit(TICKETS_COMMENT_NOTE_REMOVE, {
                                      _id: this.ticket._id,
                                      value: note._id,
                                      isNote: note.isNote,
                                    });
                                  }}
                                />
                              ))}
                          </div>
                        </TruTabSection>
                      </TruTabWrapper>
                    )}

                    {/* Comment / Notes Form */}
                    {this.ticket.status.isResolved === false &&
                      (helpers.canUser('comments:create', true) || helpers.canUser('tickets:notes', true)) && (
                        <div className="uk-width-1-1 ticket-reply uk-clearfix">
                          <Avatar image={this.props.shared.sessionUser.image} showOnlineBubble={false} />
                          <TruTabWrapper style={{ paddingLeft: 85 }}>
                            <TruTabSelectors showTrack={false}>
                              {helpers.canUser('comments:create', true) && (
                                <TruTabSelector selectorId={0} label={'Comment'} active={true} />
                              )}
                              {helpers.canUser('comments:create', true) && this.ticket.parent && (
                                <TruTabSelector selectorId={1} label={'Query'} />
                              )}
                              {helpers.canUser('tickets:notes', true) && (
                                <TruTabSelector selectorId={2} label={'Internal Note'} />
                              )}
                            </TruTabSelectors>
                            <TruTabSection
                              sectionId={0}
                              style={{ paddingTop: 0 }}
                              active={helpers.canUser('comments:create', true)}
                            >
                              <form onSubmit={(e) => this.onCommentNoteSubmit(e, 'comment')}>
                                <EasyMDE
                                  allowImageUpload={true}
                                  inlineImageUploadUrl={'/tickets/uploadmdeimage'}
                                  inlineImageUploadHeaders={{ ticketid: this.ticket._id }}
                                  ref={(r) => (this.commentMDE = r)}
                                />
                                <div className="uk-width-1-1 uk-clearfix" style={{ marginTop: 50 }}>
                                  <div className="uk-float-right">
                                    <button
                                      type="submit"
                                      className="uk-button uk-button-accent"
                                      style={{ padding: '10px 15px' }}
                                    >
                                      Post Comment
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </TruTabSection>
                            {['pm', 'tm', 'tl', 'admin'].includes(this.props.shared.sessionUser.role.normalized) && (
                              <TruTabSection sectionId={1} style={{ paddingTop: 0 }}>
                                <form onSubmit={(e) => this.onCommentNoteSubmit(e, 'query')}>
                                  <EasyMDE
                                    allowImageUpload={true}
                                    inlineImageUploadUrl={'/tickets/uploadmdeimage'}
                                    inlineImageUploadHeaders={{ ticketid: this.ticket._id }}
                                    ref={(r) => (this.queryMDE = r)}
                                  />
                                  <div className="uk-width-1-1 uk-clearfix" style={{ marginTop: 50 }}>
                                    <div className="uk-float-right">
                                      <button
                                        type="submit"
                                        className="uk-button uk-button-accent"
                                        style={{ padding: '10px 15px' }}
                                      >
                                        Post Query
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </TruTabSection>
                            )}

                            <TruTabSection
                              sectionId={2}
                              style={{ paddingTop: 0 }}
                              active={!helpers.canUser('comments:create') && helpers.canUser('tickets:notes', true)}
                            >
                              <form onSubmit={(e) => this.onCommentNoteSubmit(e, 'note')}>
                                <EasyMDE
                                  allowImageUpload={true}
                                  inlineImageUploadUrl={'/tickets/uploadmdeimage'}
                                  inlineImageUploadHeaders={{ ticketid: this.ticket._id }}
                                  ref={(r) => (this.noteMDE = r)}
                                />
                                <div className="uk-width-1-1 uk-clearfix" style={{ marginTop: 50 }}>
                                  <div className="uk-float-right">
                                    <button
                                      type="submit"
                                      className="uk-button uk-button-accent"
                                      style={{ padding: '10px 15px' }}
                                    >
                                      Save Note
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </TruTabSection>
                          </TruTabWrapper>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
            <OffCanvasEditor primaryLabel={'Save Edit'} ref={(r) => (this.editorWindow = r)} />
          </Fragment>
        )}
      </div>
    );
  }
}

SingleTicketContainer.propTypes = {
  ticketId: PropTypes.string.isRequired,
  ticketUid: PropTypes.string.isRequired,
  shared: PropTypes.object.isRequired,
  sessionUser: PropTypes.object,
  socket: PropTypes.object.isRequired,
  common: PropTypes.object.isRequired,
  ticketTypes: PropTypes.object.isRequired,
  fetchTicketTypes: PropTypes.func.isRequired,
  groupsState: PropTypes.object.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  transferToThirdParty: PropTypes.func,
  ticketStatuses: PropTypes.object.isRequired,
  fetchTicketStatus: PropTypes.func.isRequired,
  teamsState: PropTypes.object.isRequired,
  fetchTeams: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  common: state.common.viewdata,
  shared: state.shared,
  sessionUser: state.shared.sessionUser,
  socket: state.shared.socket,
  ticketTypes: state.ticketsState.types,
  ticketStatuses: state.ticketsState.ticketStatuses,
  groupsState: state.groupsState,
  teamsState: state.teamsState,
});

export default connect(mapStateToProps, {
  fetchTicketTypes,
  fetchGroups,
  fetchTicketStatus,
  unloadGroups,
  showModal,
  hideModal,
  transferToThirdParty,
  fetchTeams,
  unloadTeams,
})(SingleTicketContainer);
