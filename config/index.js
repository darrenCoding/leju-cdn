
'use strict';

const path = require('path');

let env = (argv === 't' || !args) ? 'local' : 'production';
    env = env.toLowerCase();

const file = path.resolve(__dirname, env);

const config = module.exports = require(file);