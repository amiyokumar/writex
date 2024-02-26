var mongoose = require('mongoose');

const COLLECTION = 'queries';

/**
 * Ticket Schema
 * @module models/query
 * @class Query
 * @requires {@link User}

 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {User} owner ```Required``` Reference to User Object. Owner of this Object.
 * @property {Date} date ```Required``` [default: Date.now] Date Query was created.
 * @property {Date} updated Date query was last updated
 * @property {Boolean} deleted ```Required``` [default: false] If they query is flagged as deleted.
 * @property {String} query 
 * @property {Array} users An array of user _ids that will have read/write permission on the query.
 * @property {Date} resolved ```Required``` [default: false] Date Query was resolved.
 * @property {User} owner ```Required``` Reference to User Object. Owner of this Object.
 */

var querySchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
  date: { type: Date, required: true },
  updated: { type: Date },
  query: { type: String, required: true },
  deleted: { type: Boolean, default: false, required: true },
  resolved: { type: Boolean, default: false, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'accounts' }],
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
});

/**
 * Gets Single ticket with given object _id.
 * @memberof Query
 * @static
 * @method getQueryById
 *
 * @param {Object} id MongoDb _id.
 * @param {function} callback MongoDB Query Callback
 */
querySchema.statics.getQueryById = async function (id, callback) {
  const self = this;

  return new Promise((resolve, reject) => {
    (async () => {
      if (!id) {
        const error = new Error('Invalid Id - QuerySchema.GetQueryById()');

        if (typeof callback === 'function') return callback(error, null);

        return reject(error);
      }

      const q = self
        .model(COLLECTION)
        .findOne({ _id: id, deleted: false })
        .populate('owner resolvedBy', 'username fullname email role image title');

      try {
        const result = await q.exec(callback);

        return resolve(result);
      } catch (e) {
        if (typeof callback === 'function') callback(e);

        return reject(e);
      }
    })();
  });
};

module.exports = mongoose.model(COLLECTION, querySchema);
