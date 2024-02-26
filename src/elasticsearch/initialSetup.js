const async = require('async');
const elasticsearch = require('elasticsearch');
const winston = require('../logger');
const moment = require('moment-timezone');
const database = require('../database');
const mappings = require('./mappings');

global.env = process.env.NODE_ENV || 'production';

const ES = {};
ES.indexName = process.env.ELASTICSEARCH_INDEX_NAME || 'writex';

module.exports.setupTimezone = function (callback) {
  return new Promise((resolve, reject) => {
    (async () => {
      const settingsSchema = require('../models/setting');
      try {
        const setting = await settingsSchema.getSettingByName('gen:timezone');
        let tz = 'UTC';
        if (setting && setting.value) tz = setting.value;

        ES.timezone = tz;

        if (typeof callback === 'function') return callback(null, tz);

        return resolve(tz);
      } catch (e) {
        if (typeof callback === 'function') return callback(e);
        return reject(e);
      }
    })();
  });
};

module.exports.setupDatabase = function (callback) {
  database.init(function (err, db) {
    if (err) return callback(err);

    ES.mongodb = db;

    return callback(null, db);
  }, process.env.MONGODB_URI);
};

module.exports.setupClient = function () {
  ES.esclient = new elasticsearch.Client({
    node: process.env.ELASTICSEARCH_URI,
    pingTimeout: 10000,
    requestTimeout: 10000,
    maxRetries: 5,
  });
};

module.exports.checkIndexExists = async function () {
  try {
    const exists = await ES.esclient.indices.exists({ index: ES.indexName });
    if (exists) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    winston.error(e);
  }
};

module.exports.deleteIndex = async function (callback) {
  try {
    const exists = await ES.esclient.indices.exists({ index: ES.indexName });
    if (exists) {
      await ES.esclient.indices.delete({ index: ES.indexName });

      if (typeof callback === 'function') callback();
    } else {
      if (typeof callback === 'function') callback();
    }
  } catch (e) {
    if (typeof callback === 'function') callback(e);

    winston.error(e);
  }
};

module.exports.createIndex = async function (callback) {
  try {
    await ES.esclient.indices.create({
      index: ES.indexName,
      body: {
        settings: {
          index: {
            number_of_replicas: 0,
          },
          analysis: {
            filter: {
              leadahead: {
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 20,
              },
              email: {
                type: 'pattern_capture',
                preserve_original: true,
                patterns: ['([^@]+)', '(\\p{L}+)', '(\\d+)', '@(.+)'],
              },
            },
            analyzer: {
              leadahead: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'leadahead'],
              },
              email: {
                tokenizer: 'uax_url_email',
                filter: ['email', 'lowercase', 'unique'],
              },
            },
          },
        },
        mappings,
      },
    });
    winston.info('Elasticsearch index created successfully!');
    if (typeof callback === 'function') callback();
  } catch (e) {
    if (typeof callback === 'function') callback(e);

    winston.error(e);
  }
};

module.exports.sendAndEmptyQueue = async function (bulk) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (bulk.length > 0) {
          await ES.esclient.bulk({ body: bulk, timeout: '3m' });
          winston.debug(`Sent ${bulk.length} documents to Elasticsearch!`);

          return resolve([]);
        } else return resolve([]);
      } catch (e) {
        process.send({ success: false });
        return process.exit();
      }
    })();
  });
};

module.exports.crawlUsers = function (callback) {
  const Model = require('../models/user');
  let count = 0;
  const startTime = new Date().getTime();
  const stream = Model.find({ deleted: false }).lean().cursor();

  let bulk = [];

  stream
    .on('data', async function (doc) {
      count += 1;
      bulk.push({ index: { _index: ES.indexName, _type: 'doc', _id: doc._id } });
      bulk.push({
        datatype: 'user',
        username: doc.username,
        email: doc.email,
        fullname: doc.fullname,
        title: doc.title,
        role: doc.role,
      });

      if (count % 200 === 1) bulk = await exports.sendAndEmptyQueue(bulk);
    })
    .on('error', function (err) {
      winston.error(err);
      // Send Error Occurred - Kill Process
      throw err;
    })
    .on('close', async function () {
      winston.debug('Document Count: ' + count);
      winston.debug('Duration is: ' + (new Date().getTime() - startTime));
      bulk = await exports.sendAndEmptyQueue(bulk);

      return callback();
    });
};

module.exports.crawlTickets = function (callback) {
  const Model = require('../models/ticket');
  let count = 0;
  const startTime = new Date().getTime();
  const stream = Model.find({ deleted: false })
    .populate('owner group comments.owner notes.owner tags priority type status team')
    .lean()
    .cursor();

  let bulk = [];

  stream
    .on('data', async (doc) => {
      stream.pause();
      count += 1;

      bulk.push({ index: { _index: ES.indexName, _id: doc._id } });
      const comments = [];
      if (doc.comments !== undefined) {
        doc.comments.forEach(function (c) {
          comments.push({
            comment: c.comment,
            _id: c._id,
            deleted: c.deleted,
            date: c.date,
            owner: {
              _id: c.owner?._id,
              fullname: c.owner?.fullname,
              username: c.owner?.username,
              email: c.owner?.email,
              role: c.owner?.role,
              title: c.owner?.title,
            },
          });
        });
      }
      bulk.push({
        type: 'ticket',
        uid: doc.uid,
        owner: {
          _id: doc.owner?._id,
          fullname: doc.owner?.fullname,
          username: doc.owner?.username,
          email: doc.owner?.email,
          role: doc.owner?.role,
          title: doc.owner?.title,
        },
        group: {
          _id: doc.group?._id,
          name: doc.group?.name,
        },
        issue: doc.issue,
        subject: doc.subject,
        date: doc.date,
        dateFormatted: moment.utc(doc.date).tz(ES.timezone).format('MMMM D YYYY'),
        priority: {
          _id: doc.priority?._id,
          name: doc.priority?.name,
          htmlColor: doc.priority?.htmlColor,
        },
        ticketType: { _id: doc.type?._id, name: doc.type?.name },
        status: {
          _id: doc.status?._id,
          name: doc.status?.name,
          htmlColor: doc.status?.htmlColor,
          uid: doc.status?.uid,
        },
        deleted: doc.deleted,
        comments: comments,
        notes: doc.notes,
        tags: doc.tags,
        universityName: doc.universityName,
        ticketID: doc.ticketID,
        module: doc.module,
        workCategory: doc.workCategory,
        team: {
          _id: doc.team?._id,
          name: doc.team?.name,
        },
        invoiceNumber: doc.invoiceNumber,
      });
      if (count % 200 === 1) bulk = await exports.sendAndEmptyQueue(bulk);

      stream.resume();
    })
    .on('err', function (err) {
      winston.error(err);
      // Send Error Occurred - Kill Process
      throw err;
    })
    .on('close', async () => {
      winston.debug('Document Count: ' + count);
      winston.debug('Duration is: ' + (new Date().getTime() - startTime));
      bulk = await exports.sendAndEmptyQueue(bulk);
      callback();
    });
};
