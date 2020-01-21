#!/usr/bin/env node
const commander = require("commander");
const chalk = require("chalk");
const execSync = require("child_process").execSync;
const packageJson = require("../package.json");
const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");

let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")}`)
  .action(name => {
    projectName = name;
  })
  .parse(process.argv);

if (typeof projectName === "undefined") {
  console.error("Please specify the project directory:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
  );
  console.log();
  console.log("For example:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("my-react-lib")}`
  );
  process.exit(1);
}

const projectDestination = path.join(process.cwd(), projectName);

if (fs.existsSync(projectDestination)) {
  console.log(`The directory ${chalk.green(projectName)} already exists.`);
  process.exit(1);
}

const template_path = path.join(__dirname, "..", "templates", "js-lib-template");


fs.copySync(
  template_path,
  projectName
);

fs.renameSync(`${projectName}/package-tmp.json`, `${projectName}/package.json`)

const packageJsonFileBuffer = fs.readFileSync(`${projectName}/package.json`);
let packageJsonFileJson = JSON.parse(packageJsonFileBuffer);
packageJsonFileJson.name = projectName;
packageJsonFileJson.author = getAuthorName();
fs.writeFileSync(`${projectName}/package.json`, JSON.stringify(packageJsonFileJson));

function setAuthorName(author) {
  shell.exec(`npm config set init-author-name "${author}"`, { silent: true });
}

function getAuthorName() {
  let author = '';

  author = shell
    .exec('npm config get init-author-name', { silent: true })
    .stdout.trim();
  if (author) return author;

  author = shell
    .exec('git config --global user.name', { silent: true })
    .stdout.trim();
  if (author) {
    setAuthorName(author);
    return author;
  }

  author = shell
    .exec('npm config get init-author-email', { silent: true })
    .stdout.trim();
  if (author) return author;

  author = shell
    .exec('git config --global user.email', { silent: true })
    .stdout.trim();
  if (author) return author;

  return author;
}

function shouldUseYarn() {
  try {
    execSync("yarn --version", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

process.chdir(projectDestination);

fs.writeFileSync(
  ".gitignore",
  `node_modules
  lib`
);

if (shouldUseYarn()) {
  execSync("yarn install", { stdio: [0, 1, 2] });
} else {
  execSync("npm install", { stdio: [0, 1, 2] });
}