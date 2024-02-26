/*
   
 *  
 *  Copyright (c) 2014-2022. All rights reserved.
 */
// This is used to connect to MongoStore for express-session to destroy the sessions of users

const mongoose = require('mongoose');
const winston = require('../logger');

const COLLECTION = 'sessions';

const SessionSchema = new mongoose.Schema(
  {
    _id: String,
    expires: Date,
    session: String,
  },
  { strict: false }
);

SessionSchema.statics.getAllSessionUsers = async function () {};

SessionSchema.statics.destroyUserSession = async function (userId) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (!userId) return reject(new Error('Invalid User Id'));

        const userSessions = await this.model(COLLECTION).find({});

        if (userSessions) {
          for (const s of userSessions) {
            const id = s._id;
            const sessionObject = JSON.parse(s.session);

            if (
              sessionObject.passport &&
              sessionObject.passport.user &&
              sessionObject.passport.user === userId.toString()
            ) {
              delete sessionObject.passport;
              await this.model(COLLECTION).findOneAndUpdate({ _id: id }, { session: JSON.stringify(sessionObject) });
            }
          }

          return resolve();
        } else {
          return resolve();
        }
      } catch (e) {
        winston.error(e);
        return reject(e);
      }
    })();
  });
};

SessionSchema.statics.destroy = SessionSchema.statics.destroyUserSession;

module.exports = mongoose.model(COLLECTION, SessionSchema);
