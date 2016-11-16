
'use strict';

module.exports = {
    rport: "6379",
    rhost: 'localhost',
    mailHost: "smtp.qq.com",
    mailPort: "465",
    auth : {
    	user: "",
        pass: ""
    },
    mailFrom: "",
    mailTo: "",
    mailSubject: "",
    mailHtml: "",
    requireLib : "./deps/minirequire",
    filePath : process.cwd(),
    logPath : "/data1/CACHE/sina-data/admin.imgcdn.house.sina.com.cn/cdnLog/v2.0"
}