define('modules/ui', [
  'serverSocket/socketEventConsts',
  'jquery',
  'lodash',
  'uikit',
  'modules/helpers',
  'history',
], function (socketEvents, $, _, UIKit, helpers) {
  const socketUi = {};

  let socket;

  socketUi.init = function (sock) {
    socketUi.socket = socket = sock;

    this.flushRoles();

    // Events
    this.onProfileImageUpdate();
  };

  socketUi.fetchServerLogs = function () {
    socket.emit('logs:fetch');
  };

  socketUi.flushRoles = function () {
    socket.removeAllListeners(socketEvents.ROLES_FLUSH);
    socket.on(socketEvents.ROLES_FLUSH, function () {
      helpers.flushRoles();
    });
  };

  socketUi.onProfileImageUpdate = function () {
    socket.removeAllListeners('trudesk:profileImageUpdate');
    socket.on('trudesk:profileImageUpdate', function (data) {
      var profileImage = $('#profileImage[data-userid="' + data.userid + '"]');
      if (profileImage.length > 0) {
        profileImage.attr('src', '/uploads/users/' + data.img + '?r=' + new Date().getTime());
      }
    });
  };

  return socketUi;
});
