// this is needed for the old help command so it can import new command info

module.exports = {
  analytics: require('./commands/analytics'),
  apps: true,
  build: require('./commands/build'),
  convert: require('./commands/convert'),
  deprecate: require('./commands/deprecate'),
  delete: true,
  'delete:integration': require('./commands/delete/integration'),
  'delete:version': require('./commands/delete/version'),
  describe: require('./commands/describe'),
  env: true, // used so that aliases are properly routed into oclif, but `env` itself doesn't show in help/docs
  'env:get': require('./commands/env/get'),
  'env:set': require('./commands/env/set'),
  'env:unset': require('./commands/env/unset'),
  history: require('./commands/history'),
  jobs: require('./commands/jobs'),
  init: require('./commands/init'),
  integrations: require('./commands/integrations'),
  link: require('./commands/link'),
  login: require('./commands/login'),
  logs: require('./commands/logs'),
  logout: require('./commands/logout'),
  migrate: require('./commands/migrate'),
  promote: require('./commands/promote'),
  push: require('./commands/push'),
  scaffold: require('./commands/scaffold'),
  register: require('./commands/register'),
  team: true,
  'team:add': require('./commands/team/add'),
  'team:get': require('./commands/team/get'),
  'team:remove': require('./commands/team/remove'),
  test: require('./commands/test'),
  upload: require('./commands/upload'),
  users: true,
  'users:add': require('./commands/users/add'),
  'users:get': require('./commands/users/get'),
  'users:links': require('./commands/users/links'),
  'users:remove': require('./commands/users/remove'),
  validate: require('./commands/validate'),
  versions: require('./commands/versions'),
};
