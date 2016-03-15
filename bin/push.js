#!/usr/bin/env node

'use strict';

const child_process = require('child_process');
const path = require('path');
const words = process.argv[2];


let comment = words || 'fix a bug';

const command = child_process.exec(
        'sudo git add . && sudo git commit -m "' + comment +'" && sudo git push origin master && sudo npm publish',
        {cwd: path.resolve(__dirname, '..')},
        function(err,stdout,stderr){
        	if(err || stderr){
        		return console.log(err);
        	}
        });

command.stdout.on('data', function (data) {
    console.log(data);
})