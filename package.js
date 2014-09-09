Package.describe({
  name: 'friends',
  summary: "A friends system for meteor, send friend requests and add and remove friends"
});

Package.on_test(function (api) {
  api.use('underscore', 'server');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('accounts-base', ['client', 'server']);
  api.use('accounts-password', ['client', 'server']);
  api.use('autopublish', ['client', 'server']);
  api.use('insecure', ['client', 'server']);

  api.add_files('validation.js', ['client', 'server']);
  api.add_files('friends.js', ['client', 'server']);
  api.add_files('friends-test.js');
});

Package.on_use(function (api, where) {
  api.use('underscore', 'server');
  api.use('accounts-base', ['client', 'server']);
  api.use('accounts-password', ['client', 'server']);

  api.add_files('validation.js', ['client', 'server']);
  api.add_files('friends.js', ['client', 'server']);

  api.export('Friends');
});