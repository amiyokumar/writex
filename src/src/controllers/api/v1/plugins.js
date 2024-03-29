var winston = require('winston');

var path = require('path');

var fs = require('fs');

var request = require('request');

var rimraf = require('rimraf');

var mkdirp = require('mkdirp');

var tar = require('tar');

var apiPlugins = {};

var pluginPath = path.join(__dirname, '../../../../plugins');

var pluginServerUrl = 'http://plugins.trudesk.io';

apiPlugins.installPlugin = function (req, res) {
  var packageid = req.params.packageid;

  request.get(pluginServerUrl + '/api/plugin/package/' + packageid, function (err, response) {
    if (err) return res.status(400).json({ success: false, error: err });

    var plugin = JSON.parse(response.body).plugin;

    if (!plugin || !plugin.url) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Plugin: Not found in repository - ' + pluginServerUrl,
      });
    }

    request
      .get(pluginServerUrl + '/plugin/download/' + plugin.url)
      .on('response', function (response) {
        var fws = fs.createWriteStream(path.join(pluginPath, plugin.url));

        response.pipe(fws);

        response.on('end', function () {
          // Extract plugin
          var pluginExtractFolder = path.join(pluginPath, plugin.name.toLowerCase());
          rimraf(pluginExtractFolder, function (error) {
            if (error) winston.debug(error);
            if (error)
              return res.json({
                success: false,
                error: 'Unable to remove plugin directory.',
              });

            var fileFullPath = path.join(pluginPath, plugin.url);
            mkdirp.sync(pluginExtractFolder);

            tar.extract(
              {
                C: pluginExtractFolder,
                file: path.join(pluginPath, plugin.url),
              },
              function () {
                rimraf(fileFullPath, function (err) {
                  if (err) return res.status(400).json({ success: false, error: err });

                  request.get(
                    pluginServerUrl + '/api/plugin/package/' + plugin._id + '/increasedownloads',
                    function () {
                      res.json({ success: true, plugin: plugin });
                      restartServer();
                    }
                  );
                });
              }
            );
          });
        });

        response.on('error', function (err) {
          return res.status(400).json({ success: false, error: err });
        });
      })
      .on('error', function (err) {
        return res.status(400).json({ success: false, error: err });
      });
  });
};

apiPlugins.removePlugin = function (req, res) {
  var packageid = req.params.packageid;

  request.get(pluginServerUrl + '/api/plugin/package/' + packageid, function (err, response, body) {
    if (err) return res.status(400).json({ success: false, error: err });

    var plugin = JSON.parse(body).plugin;

    if (plugin === null) {
      return res.json({ success: false, error: 'Invalid Plugin' });
    }

    rimraf(path.join(pluginPath, plugin.name.toLowerCase()), function (err) {
      if (err) winston.debug(err);
      if (err)
        return res.json({
          success: false,
          error: 'Unable to remove plugin directory.',
        });

      res.json({ success: true });
      restartServer();
    });
  });
};

function restartServer() {
  var pm2 = require('pm2');
  pm2.connect(function (err) {
    if (err) {
      winston.error(err);
    }

    pm2.restart('trudesk', function (err) {
      if (err) {
        return winston.error(err);
      }

      pm2.disconnect();
    });
  });
}

module.exports = apiPlugins;
