
'use strict';
const nodemailer = require('nodemailer');
const config = require('../config');
const log4js = require('../config/log');

const smtpTransport = nodemailer.createTransport("SMTP", {
    host: config.mailHost,
    secureConnection: true,
    port: config.mailPort,
    auth: config.auth
});

const mailOptions = {
    from: config.mailFrom,
    to: config.mailTo,
    subject: config.mailSubject,
    html: config.mailHtml
}

module.exports = function(){
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            log4js.logger_e.error('mail error:' + err.stack || err.message);
        } else {
            log4js.logger_c.info("mail send succeed");
        }
    });
}