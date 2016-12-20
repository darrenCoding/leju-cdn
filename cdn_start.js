'use strict';

const querystring = require('querystring');
const onFinished  = require('on-finished');
const http        = require('http');
const path        = require('path');
const co          = require('co');
const uri         = require('url');
const combo       = require('static-combo');
const mime        = require('mime-types');
const args        = process.argv.slice(2),
      port        = (args[0] && /^\d+$/.test(args[0])) ? parseInt(args[0]) : 8030;
global.argv       = (~['t','p','l'].indexOf(args[1])) ? args[1] : 't';
const compress    = ~['t','l'].indexOf(argv) ? false : true;
const config      = require('./config');
const mw          = require('./middleware/prompt');
const email       = require('./middleware/mail');
const db          = require('./db');
const log4js      = require('./config/log');

const slice = Array.prototype.slice;

combo.config({
	base_path : config.filePath,
	compress : compress,
	js_module : {
		AMD : { 
			baseUrl: config.filePath,
			paths: {
				requireLib: config.requireLib
			},
			name: 'requireLib',
			skipModuleInsertion: true,
			uglify: {
				make_seqs : false,
				dead_code : false
			}
		},
		COMMONJS : {
		}
	}
})

let respond = (req, res, code, type, data) => {
	if ( code <= 400 ) {
		mw.fresh(req, data, (err, status, hash, date) => {
			if ( err ) {
                respond(req, res, 404, 'html', err);
			} else {
				code = status ? 304 : code;
			}

			let length = status ? 0 : (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data, 'utf8'));
			
			res.writeHead(code,{
				'Content-Type' : mime.lookup(type) + '; charset=utf-8',
				'Content-Length' : length,
				'Last-Modified' : date,
				'Etag' : hash
			})
			res.end(new Buffer(data))
		})
	} else {
		res.writeHead(code, {
			'Content-Type' : mime.lookup(type) + '; charset=utf-8',
		})
		res.end(new Buffer(`<center><h1>${data}</h1></center><hr><center>`));
	}
}

let makeContents = (pathname, include, errorinfo) => {
	return querystring.stringify({
		pathname : mw.getUrl(pathname),
		include : include.join(','),
		errorinfo : errorinfo ? String(errorinfo) : ''
	})
}

let app = (req, res) => {
	let files,
        url,
        type;
	try{
		let obj_r = uri.parse(req.url, true);
            type  = path.extname(obj_r.pathname).slice(1);
		req.resume();
	}catch(err){
		respond(req, res, 500, 'html', err);
	}
	
	co(function* (){
		url = yield new Promise( (resolve, reject) => {
			onFinished(req, (err,req) => {
				if ( err ) {
					reject(err);
				} else {
					if ( req.url != '/favicon.ico' ) {
                        resolve(req.url.replace(/^\//, ''));   
					} else {
						reject();
					}
				}
			})
		});

		let dbata = yield new Promise( (resolve, reject) => {
			db.get(url, (err, data) => {
				if ( err ) {
					reject(err);
				} else {
					resolve(data);
				}
			})
		});

		let rdata = yield new Promise( (resolve, reject) => {
			if ( !dbata ) {
				combo(req.url, (err, data, deps) => {
		            if ( err ) {
		                reject({
		                	udefine : true,
		                	code : 404,
                            msg : err
		                });
		            } else {
		            	files = deps;
		            	resolve(data);
		            }
		        }); 
			} else {
				respond(req, res, 200, type, dbata);
				reject();
			}
		})

		let sdata = yield new Promise( (resolve, reject) => {
			rdata = '/***<ljtime>'+ mw.getTime() + '</ljtime>***/' + rdata;
			if ( argv === 'p' ) {
                db.set(url, rdata, (err, data) => {
				    err && reject(err)
                });
			}
            respond(req, res, 200, type, rdata);
            resolve();
		})

	}).then(() => {
		mw.save(makeContents(url, files))
	},( err ) => {
		let code,
		    msg = String(err);
		if ( typeof err === 'object' && err.udefine ) {
			code = err.code || 500;
			msg  = String(err.msg) || '';
		}
		if ( err ) {
			respond(req, res, code, 'html', msg);
			mw.save(makeContents(url, files));
			return log4js.logger_e.error(msg);
		}
	})
}

app.listen = (port) => {
 	let server = http.createServer(app);
  	return server.listen.call(server, port);
};

app.listen(port);
