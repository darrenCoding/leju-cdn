const redis = require('redis');
const config = require('./config');
const log4js = require('./config/log');
const client = redis.createClient(config.rport, config.rhost);

client.on('error', function(err, data) {
    log4js.logger_e.error('redis error:' + err.stack || err.message);
});

module.exports = client;