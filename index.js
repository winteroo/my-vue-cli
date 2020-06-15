#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const inquirer = require('inquirer');
const symbols = require('log-symbols');
const download = require('download-git-repo');
const child_process = require('child_process');
const handlebars = require('handlebars');
const path = require('path');
const gitPath = require('./config');

program.version('1.0.0', '-v, --version').
command('init <name>').
action(name => {
  if (!fs.existsSync(name)) {
    console.log('正在创建项目...');
    inquirer.prompt([{
        name: 'description',
        message: '请输入项目描述'
      },
      {
        name: 'author',
        message: '请输入作者名称'
      }
    ]).then(answers => {
      const spinner = ora('正在向下载模板...\n');
      spinner.start();
      child_process.exec(`git clone ${gitPath}`, function (err, stdout, stderr) {
        if (err) {
          spinner.fail();
          console.log(symbols.error, chalk.red('模板下载失败'))
          console.log(err);
        } else {
          spinner.succeed();
          const temp = gitPath.split('/');
          const gitdirname = temp[temp.length - 1];
          const filename = path.join(__dirname, gitdirname, 'package.json');
          const meta = {
            name,
            description: answers.description,
            author: answers.author
          }
          if (fs.existsSync(filename)) {
            const content = fs.readFileSync(filename).toString();
            let dt = JSON.parse(content);
            dt.name = '{{name}}';
            dt.description = '{{description}}'
            const result = handlebars.compile(JSON.stringify(dt, null, 2))(meta);
            fs.writeFileSync(filename, result);
            console.log(symbols.success, chalk.green('项目初始化完成'));
          } else {
            console.log(symbols.error, chalk.red('package不存在'))
          }
        }
      })
    })
  } else {
    console.log(symbols.error, chalk.red('项目已存在'));
  }
})
program.parse(process.argv);