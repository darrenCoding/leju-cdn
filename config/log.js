var log4js = require('log4js');
var config = require('./index');

log4js.configure({
    appenders: [
      { 
      	type: 'console' 
      },
      {
        type: 'file',
        filename: 'out.log', 
        maxLogSize: 1048576,
        backups:3,
        category: 'normal' 
      },
      {
        type: 'file', 
        filename: 'system_error.log', 
        maxLogSize: 1048576,
        backups:3,
        category: 'error' 
      }
    ],
    replaceConsole: true
  },
  {
      cwd : config.logPath
  }
);

var logger_c = log4js.getLogger('normal'),
	 logger_e = log4js.getLogger('error');
logger_c.setLevel('INFO');
logger_e.setLevel('ERROR');

module.exports = {
	"logger_c" : logger_c,
	"logger_e" : logger_e
}