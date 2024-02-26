const _ = require('lodash');
const path = require('path');
const nconf = require('nconf');
const winston = require('../logger');
const elasticsearch = require('elasticsearch');
const emitter = require('../emitter');
const moment = require('moment-timezone');
const settingUtil = require('../settings/settingsUtil');
const mappings = require('./mappings');
const { setupClient, checkIndexExists, createIndex } = require('./initialSetup');

const ES = {};
ES.indexName = process.env.ELASTICSEARCH_INDEX_NAME || 'writex';

const checkConnection = (callback) => {
  const errorText = 'Elasticsearch client not initialized. Restart Writex!';
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (!ES.esclient) {
          if (typeof callback === 'function') callback(errorText);

          return reject(errorText);
        }

        await ES.esclient.ping();

        if (typeof callback === 'function') callback();

        return resolve();
      } catch (e) {
        if (typeof callback === 'function') callback(errorText);

        return reject(errorText);
      }
    })();
  });
};

ES.testConnection = async (callback) => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (process.env.ELASTICSEARCH_URI) ES.host = process.env.ELASTICSEARCH_URI;
        else ES.host = nconf.get('elasticsearch:host') + ':' + nconf.get('elasticsearch:port');

        ES.esclient = new elasticsearch.Client({
          node: ES.host,
        });

        await checkConnection();

        if (typeof callback === 'function') callback();

        return resolve();
      } catch (e) {
        if (typeof callback === 'function') callback(e);

        return reject(e);
      }
    })();
  });
};

ES.setupHooks = () => {
  const ticketSchema = require('../models/ticket');

  emitter.on('ticket:deleted', async (_id) => {
    if (_.isUndefined(_id)) return false;

    try {
      await ES.esclient.delete({
        index: ES.indexName,
        id: _id.toString(),
        refresh: 'true',
      });
    } catch (e) {
      winston.warn('Elasticsearch Error: ' + e);
    }
  });

  emitter.on('ticket:updated', async (data) => {
    if (_.isUndefined(data._id)) return;

    try {
      const ticket = await ticketSchema.getTicketById(data._id.toString());

      const cleanedTicket = {
        type: 'ticket',
        uid: ticket.uid,
        subject: ticket.subject,
        issue: ticket.issue,
        date: ticket.date,
        owner: ticket.owner,
        assignee: ticket.assignee,
        group: {
          _id: ticket.group._id,
          name: ticket.group.name,
        },
        comments: ticket.comments,
        notes: ticket.notes,
        deleted: ticket.deleted,
        priority: {
          _id: ticket.priority._id,
          name: ticket.priority.name,
          htmlColor: ticket.priority.htmlColor,
        },
        ticketType: { _id: ticket.type._id, name: ticket.type.name },
        status: {
          _id: ticket.status?._id,
          name: ticket.status?.name,
          htmlColor: ticket.status?.htmlColor,
          uid: ticket.status?.uid,
        },
        tags: ticket.tags,
        universityName: ticket.universityName,
        ticketID: ticket.ticketID,
        module: ticket.module,
        wordCount: ticket.wordCount,
        verdict: ticket.verdict,
        marks: ticket.marks,
        workCategory: ticket.workCategory,
        team: {
          _id: ticket.team?._id,
          name: ticket.team?.name,
        },
        invoiceNumber: ticket.invoiceNumber,
      };

      await ES.esclient.index({
        index: ES.indexName,
        id: ticket._id.toString(),
        refresh: 'true',
        body: { ...cleanedTicket, mappings },
      });
    } catch (e) {
      winston.warn('Elasticsearch Error: ' + e);
      return false;
    }
  });

  emitter.on('ticket:created', (data) => {
    ticketSchema.getTicketById(data.ticket._id, function (err, ticket) {
      if (err) {
        winston.warn('Elasticsearch Error: ' + err);
        return false;
      }

      const _id = ticket._id.toString();
      const cleanedTicket = {
        type: 'ticket',
        uid: ticket.uid,
        subject: ticket.subject,
        issue: ticket.issue,
        date: ticket.date,
        dateFormatted: moment.utc(ticket.date).tz(ES.timezone).format('MMMM D YYYY'),
        owner: ticket.owner,
        assignee: ticket.assignee,
        group: {
          _id: ticket.group._id,
          name: ticket.group.name,
        },
        comments: ticket.comments,
        notes: ticket.notes,
        deleted: ticket.deleted,
        priority: {
          _id: ticket.priority._id,
          name: ticket.priority.name,
          htmlColor: ticket.priority.htmlColor,
        },
        typeTicket: { _id: ticket.type._id, name: ticket.type?.name },
        status: {
          _id: ticket.status?._id,
          name: ticket.status?.name,
          htmlColor: ticket.status?.htmlColor,
          uid: ticket.status?.uid,
        },
        tags: ticket.tags,
        universityName: ticket.universityName,
        ticketID: ticket.ticketID,
        module: ticket.module,
        workCategory: ticket.workCategory,
        team: {
          _id: ticket.team?._id,
          name: ticket.team?.name,
        },
        invoiceNumber: ticket.invoiceNumber,
      };

      ES.esclient.index(
        {
          index: ES.indexName,
          id: _id,
          body: { ...cleanedTicket, mappings },
        },
        function (err) {
          if (err) winston.warn('Elasticsearch Error: ' + err);
        }
      );
    });
  });
};

ES.buildClient = (host) => {
  if (ES.esclient) ES.esclient.close();

  ES.esclient = new elasticsearch.Client({
    //node: host,
    node: host,
    pingTimeout: 10000,
    maxRetries: 5,
  });
};

ES.rebuildIndex = async () => {
  if (global.esRebuilding) {
    winston.warn('Index Rebuild attempted while already rebuilding!');
    return;
  }
  try {
    const settings = await settingUtil.getSettings();

    if (!settings.data.settings.elasticSearchConfigured.value) return false;

    const s = settings.data.settings;
    if (process.env.ELASTICSEARCH_URI) ES.host = process.env.ELASTICSEARCH_URI;
    else ES.host = nconf.get('elasticsearch:host') + ':' + nconf.get('elasticsearch:port');

    ES.buildClient(ES.host);

    global.esStatus = 'Rebuilding...';

    const fork = require('child_process').fork;
    const esFork = fork(path.join(__dirname, 'rebuildIndexChild.js'), {
      env: {
        FORK: 1,
        NODE_ENV: global.env,
        ELASTICSEARCH_INDEX_NAME: ES.indexName,
        ELASTICSEARCH_URI: ES.host,
        MONGODB_URI: global.CONNECTION_URI,
      },
    });

    global.esRebuilding = true;
    global.forks.push({ name: 'elasticsearchRebuild', fork: esFork });

    esFork.once('message', function (data) {
      global.esStatus = data.success ? 'Connected' : 'Error';
      global.esRebuilding = false;
    });

    esFork.on('exit', function () {
      winston.debug('Rebuilding Process Closed: ' + esFork.pid);
      global.esRebuilding = false;
      global.forks = _.filter(global.forks, function (i) {
        return i.name !== 'elasticsearchRebuild';
      });
    });
  } catch (e) {
    winston.error(e);
    return false;
  }
};

ES.getIndexCount = async (callback) => {
  return new Promise((resolve, reject) => {
    if (_.isUndefined(ES.esclient)) {
      const error = 'Elasticsearch has not initialized';

      if (typeof callback === 'function') callback(error);

      return reject(error);
    }

    const count = ES.esclient.count({ index: ES.indexName });
    if (typeof callback === 'function') callback(null, count);

    return resolve(count);
  });
};

ES.init = async (callback) => {
  try {
    global.esStatus = 'Not Configured';
    global.esRebuilding = false;

    const s = await settingUtil.getSettings();
    const settings = s.data.settings;
    const ENABLED = settings.elasticSearchConfigured.value;

    if (!ENABLED) {
      if (typeof callback === 'function') return callback();

      return false;
    }

    winston.debug('Initializing Elasticsearch...');
    global.esStatus = 'Initializing';
    ES.timezone = settings.timezone.value;

    ES.setupHooks();

    if (process.env.ELATICSEARCH_URI) ES.host = process.env.ELATICSEARCH_URI;
    else ES.host = settings.elasticSearchHost.value + ':' + settings.elasticSearchPort.value;
    ES.buildClient(ES.host);

    await checkConnection();

    winston.info('Elasticsearch Running... Connected.');
    global.esStatus = 'Connected';

    //Check if index exists, if not create
    setupClient();
    const bIndexExists = await checkIndexExists();
    if (!bIndexExists) {
      await createIndex();
    }

    if (typeof callback === 'function') callback();
  } catch (e) {
    global.esStatus = 'Error';
    if (typeof callback === 'function') callback(e);
  }
};

ES.checkConnection = async (callback) => {
  try {
    await checkConnection();

    global.esStatus = 'Connected';

    if (typeof callback === 'function') return callback();
  } catch (e) {
    global.esStatus = 'Error';
    winston.warn(e);
    if (typeof callback === 'function') return callback();
  }
};

module.exports = ES;
