const redis  = require('redis');
const config = require('./config');
const log4js = require('./config/log');
const client = redis.createClient(config.rport, config.rhost);

client.on('error', (err, data) => {
    log4js.loggerE.error(`[redis] error: ${String(err)}`);
});

module.exports = client;