const _ = require('lodash');
const NodeCache = require('node-cache');
const path = require('path');
const cache = {};

cache.init = function () {
  global.cache = new NodeCache({ checkperiod: 0 });
  cache.memLimit = process.env.CACHE_MEMLIMIT || '2048';
  const env = { FORK: 1, NODE_ENV: global.env, TIMEZONE: global.timezone };
  cache.env = _.merge(cache.env, env);

  spawnCache();
  setInterval(spawnCache, 55 * 60 * 1000);
};

cache.forceRefresh = function () {
  spawnCache();
};

function spawnCache() {
  const fork = require('child_process').fork;

  const n = fork(path.join(__dirname, './index.js'), {
    execArgv: ['--max-old-space-size=' + cache.memLimit],
    env: cache.env,
  });

  cache.fork = n;

  global.forks.push({ name: 'cache', fork: n });

  n.on('message', function (data) {
    if (data.cache) {
      global.cache.data = data.cache.data;
    }
  });

  n.on('close', function () {
    _.remove(global.forks, function (i) {
      return i.name === 'cache';
    });
  });
}

module.exports = cache;
