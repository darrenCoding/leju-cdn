
'use strict';

const log4js = require('log4js');
const config = require('./index');

log4js.configure({
    appenders: [
        { 
            type: 'console' 
        },
        {
            type: 'file',
            filename: 'system_out.log', 
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

let loggerC = log4js.getLogger('normal'),
    loggerE = log4js.getLogger('error');
loggerC.setLevel('INFO');
loggerE.setLevel('ERROR');

module.exports = {
    "loggerC" : loggerC,
    "loggerE" : loggerE
}