
'use strict';

const path = require('path');

const env = {
	"t" : "test",
	"l" : "local",
	"p" : "production"
}

const file = path.resolve(__dirname, env[argv]);

const config = module.exports = require(file);