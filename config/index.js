
'use strict';

const path = require('path');

global.env = {
	"t" : "test",
	"l" : "local",
	"p" : "production"
}

const file = path.resolve(__dirname, env[argv]);

const config = module.exports = require(file);