#!/usr/bin/env node

'use strict';

const child_process = require('child_process');
const path = require('path');
const words = process.argv[2];


let comment = words || 'fix a bug';

/*const command = child_process.spawn(
        'git',['add','.'],
        {cwd: path.resolve(__dirname, '..')});*/
const command = child_process.exec(
        'sudo git add . && sudo git commit -m "fix a bug" ',
        {cwd: path.resolve(__dirname, '..')},function(err,stdout,stderr){
        	if(err){
        		return console.log(err);
        	}
        	console.log(stdout + "1111");
        	/*console.log(stderr + "2222");*/
        });

command.stdout.on('data', function (data) {
    console.log(data + '333');
})

command.stdout.on('error', function (data) {
    console.log(data + '444');
})