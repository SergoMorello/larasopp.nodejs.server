#!/usr/bin/env node

const { program } = require('commander');
const packageJson = require('../package.json');

program.command('start').action(() => {
	require('../dist/index');
});

program.version(packageJson.version);

program.parse(process.argv);