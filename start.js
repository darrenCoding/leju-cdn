'use strict';

const http = require('http');
const path = require('path');
const co = require('co');
const onFinished = require('on-finished');
const combo = require('static-combo');
const querystring = require('querystring');
const mime = require('mime-types');
const args = process.argv.slice(2),
	  env = args[0] && args[0].slice(1),
	  port = (args[1] && /^\d+$/.test(args[0])) ? parseInt(args[0]) : 8030;
global.argv = (env && ~['t','p'].indexOf(env)) ? env : 't';
const mw = require('./middleware/prompt');
const email = require('./middleware/mail');
const db = require('./db');
const log4js = require('./config/log');

const slice = Array.prototype.slice;

let respond = (req,res,code,type,data) => {
	if(code <= 400){
		mw.fresh(req,data,function(err,status,hash,date){
			if(err){
				respond(req,res,404,"html",err);
			}else{
				code = status ? 304 : code;
			}
			let length = status ? 0 : (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data,'utf8'));
			res.writeHead(code,{
				'Content-Type' : mime.lookup(type) + '; charset=utf-8',
				'Content-Length' : length,
				'Last-Modified' : date,
				'Etag' : hash
			})
			res.end(new Buffer(data))
		})
	}else{
		res.writeHead(code,{
			'Content-Type' : mime.lookup(type) + '; charset=utf-8',
		})
		res.end(data);
	}
}

let makeContents = (pathname,include,errorinfo) => {
	return querystring.stringify({
		pathname : mw.getUrl(pathname),
		include : include.join(","),
		errorinfo : errorinfo ? String(errorinfo) : ''
	})
}

let app = (req,res) => {
	let files,
		url = req.url.replace(/^\//, ''),
		type = path.extname(url).slice(1).match(/(^[^?]+)(?:\?\w+)?/)[1];
	req.resume();
	co(function* (){
		let creq = yield new Promise((resolve,reject) => {
			onFinished(req,(err,req) => {
				if(err){
					reject(err);
				}else{
					resolve(req);
				}
			})
		});

		let dbata = yield new Promise((resolve,reject) => {
			db.get(url, (err,data) => {
				if (err){
					reject(err);
				}else{
					resolve(data);
				}
			})
		});

		let rdata = yield new Promise((resolve,reject) => {
			if (creq.url != '/favicon.ico'){
				if(!dbata){
					combo(creq.url,(err,data,deps) => {
						files = deps;
			            if(err){
			                reject(err);
			            }else{
			            	resolve(data);
			            }
			        }); 
				}else{
					respond(req,res,200,type,dbata);
					reject();
				}
			}
		})

		let sdata = yield new Promise((resolve,reject) => {
			rdata = "/**" + new Date().toUTCString() + "**/" + rdata;
			try {
                db.set(url, rdata, function(err, data) {
					err && reject(err)
                });
            } catch (e) {
                reject(e)
            }
            respond(req,res,200,type,rdata);
            resolve();
		})

	}).then(function(){
		mw.save(makeContents(url,files))
	},function(err){
		if(err){
			respond(req,res,404,"html",String(err));
			mw.save(makeContents(url,files))
			return log4js.logger_e.error(err.stack || err.message);
		}
	})
}

app.listen = (port) => {
 	let server = http.createServer(app);
  	return server.listen.call(server, port);
};

app.listen(port);
