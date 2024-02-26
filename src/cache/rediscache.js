const _ = require('lodash');
const redis = require('redis');
const winston = require('winston');

// const REDIS_PORT = process.env.REDIS_PORT || 6379;
// const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

const client = redis.createClient(32819, '127.0.0.1');

client.on('error', function (err) {
  winston.warn(err);
});

const redisCache = {};

redisCache.setCache = function (key, value, callback, ttl) {
  if (!_.isArray(value)) {
    value = [value];
  }
  if (!_.isUndefined(ttl)) {
    const importMulti = client.multi();
    const v = JSON.stringify(value);
    importMulti.hmset(rake('$trudesk', key), { data: v });
    importMulti.expire(rake('$trudesk', key), 600);

    // value.forEach(function(item) {
    //     const v = JSON.stringify(item);
    //     importMulti.hmset(rake('$trudesk', key), {_id: item._id.toString(), data: v});
    //     importMulti.expire(rake('$trudesk', key), 600);
    // });

    importMulti.exec(function (err) {
      if (err) return callback(err);

      client.quit();

      return callback();
    });
  } else {
    return client.set(key, value);
  }
};

redisCache.getCache = function (key, callback) {
  return client.hgetall(key, callback);
};

function rake() {
  return Array.prototype.slice.call(arguments).join(':');
}

module.exports = redisCache;
