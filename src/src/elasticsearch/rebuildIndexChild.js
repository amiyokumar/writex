const async = require('async');
const winston = require('winston');
const { setupDatabase, setupTimezone, setupClient, deleteIndex, createIndex, crawlTickets } = require('./initialSetup');

function rebuild(callback) {
  async.series(
    [
      function (next) {
        setupDatabase(next);
      },
      function (next) {
        setupTimezone(next);
      },
      function (next) {
        deleteIndex(next);
      },
      function (next) {
        createIndex(next);
      },
      function (next) {
        crawlTickets(next);
      },
    ],
    function (err) {
      if (err) winston.error(err);

      return callback(err);
    }
  );
}

(function () {
  winston.info('Starting Elasticsearch index rebuild...');
  setupClient();
  rebuild(function (err) {
    if (err) {
      process.send({ success: false, error: err });
      return process.exit(0);
    }

    winston.info('Elasticsearch rebuild completed successful.');

    //  Kill it in 10sec to offset refresh timers
    setTimeout(function () {
      process.send({ success: true });
      return process.exit();
    }, 6000);
  });
})();
