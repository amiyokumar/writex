global.react = {}; // Global react var for calling state outside react.

require(['jquery', 'modules/helpers', 'async', 'singleton/sessionSingleton', 'singleton/settingsSingleton'], function (
  $,
  helpers,
  async,
  SessionService,
  SettingsService
) {
  $(document).ready(function () {
    // Call the Session service before bootstrapping.
    // Allowing the SessionUser to be populated before the controllers have access.
    async.parallel(
      [
        function (done) {
          SessionService.init(done);
        },
        function (done) {
          SettingsService.init(done);
        },
      ],
      function (err) {
        if (err) console.log(err);
        if (err) throw new Error(err);

        helpers.init();

        require(['lodash', 'uikit', 'modules/ajaxify', 'pace'], function (_, nav) {
          // React Bootstrap
          require('../../client/app.jsx');

          nav.init();

          const $event = _.debounce(() => {
            helpers.hideLoader(1000);

            $.event.trigger('trudesk:ready', window);
          }, 100);

          $event();
        });
      }
    );
  });
});
