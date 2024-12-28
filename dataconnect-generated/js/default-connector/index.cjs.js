const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'yuzu-app',
  location: 'us-west1'
};
exports.connectorConfig = connectorConfig;

