
'use strict';

const http = require('http');
const crypto = require('crypto');

module.exports = {
	save(contents) {
        //内部接口
    },
    fresh : (() => {
    	let hash,
    		date,
    		isold = false;
    	let getHash = (data) => {
    		let md5 = crypto.createHash('md5');
		    md5.update(data);
		    return hash = "W/" + md5.digest('hex');
    	}

    	let lastModified = (data) => {
    		return date = data.slice(0,data.indexOf("**/")).replace(/\/\*\*/,'');
    	}

    	let check = (req,data) => {
    		if(req.headers['if-none-match'] && req.headers['if-none-match'] === getHash(data)){
		    	isold = true;
		    }
		    if(req.headers['if-modified-since'] && req.headers['If-Modified-Since'] === lastModified(data)){
		    	isold = true;
		    }
		    return isold;
    	}
    	return (req,data,cb) => {
    		try{
    			cb(null,check(req,data),hash,date)
    		}catch(e){
    			cb(e)
    		}
    	}
    }()),
    getUrl(path){
    	let parr = path.match(/(.+\.\w+)(\?)(.+)/);
    	return (!parr || (~['r','c','s','l'].indexOf(parr[3]))) ? path : parr[1]
    }
}