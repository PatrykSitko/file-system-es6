import fs from 'fs';
import util from 'util';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';

const projectPath = path.join(dirname(fileURLToPath(import.meta.url)), '../');
const exec = util.promisify(child_process.exec);

function isFile(path) {
  return fs.lstatSync(path).isFile();
}
function isDirectory(path) {
  return fs.lstatSync(path).isDirectory();
}
function copyFileSync(source, target) {
  let targetFile = target;

  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];

  //check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function(file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}
/**
 * @returns {Boolean} true if command is available; else false;
 */
async function isCommandAvailable(command) {
  try {
    await exec(command);
  } catch ({ stderr }) {
    if (
      stderr ===
      `'${command}' is not recognized as an internal or external command,\r\noperable program or batch file.\r\n`
    ) {
      return false;
    }
  }
  return true;
}

async function getFileName(filePath) {
  let filepath = filePath;
  if (filepath.includes(projectPath)) {
    filepath = filePath.replace(projectPath, '');
  }
  while (filepath.includes("'")) {
    filepath = filepath.replace("'", '');
  }
  if ((await fs.promises.lstat(`${filepath}`)).isDirectory()) {
    return undefined;
  } else {
    return filepath.slice(filepath.lastIndexOf('\\') + 1, filepath.length);
  }
}

export default {
  ...fs,
  isDirectory,
  isFile,
  exec,
  path,
  copyFileSync,
  copyFolderRecursiveSync,
  isCommandAvailable,
  getFileName,
  __projectPath: projectPath
};