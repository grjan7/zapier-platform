const _ = require('lodash');
const crypto = require('crypto');
const os = require('os');
const path = require('path');

const fse = require('fs-extra');

const fixHome = (dir) => {
  const home = process.env.HOME || process.env.USERPROFILE;
  return dir.replace(/^~/, home);
};

const fileExistsSync = (fileName) => {
  try {
    fse.accessSync(fileName);
    return true;
  } catch (e) {
    return false;
  }
};

const validateFileExists = (fileName, errMsg) => {
  return fse.access(fileName).catch(() => {
    let msg = `: File ${fileName} not found.`;
    if (errMsg) {
      msg += ` ${errMsg}`;
    }
    throw new Error(msg);
  });
};

// Returns a promise that reads a file and returns a buffer.
const readFile = (fileName, errMsg) => {
  return validateFileExists(fileName, errMsg).then(() =>
    fse.readFile(fixHome(fileName))
  );
};

const readFileStr = async (fileName, errMsg) => {
  const buf = await readFile(fileName, errMsg);
  return buf.toString();
};

// Returns a promise that writes a file.
const writeFile = (fileName, data) => {
  if (!data) {
    throw new Error('No data provided');
  }
  return fse.writeFile(fixHome(fileName), data);
};

// deletes a file, eats the error
const deleteFile = (path) => {
  try {
    fse.unlinkSync(path);
    return true;
  } catch (err) {
    return false;
  }
};

// Returns a promise that ensures a directory exists.
const ensureDir = (dir) => fse.ensureDir(dir);

const copyFile = (src, dest, mode) => {
  return new Promise((resolve, reject) => {
    const readStream = fse.createReadStream(src);
    const writeStream = fse.createWriteStream(dest, { mode });

    readStream.on('error', reject);
    writeStream.on('error', reject);

    writeStream.on('open', function () {
      readStream.pipe(writeStream);
    });

    writeStream.once('finish', (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

// Returns a promise that copies a directory.
const copyDir = async (src, dst, options) => {
  const defaultFilter = (srcPath) => {
    const isntPackage = !srcPath.includes('node_modules');
    const isntBuild = !srcPath.endsWith('.zip');
    return isntPackage && isntBuild;
  };

  options = _.defaults(options || {}, {
    clobber: false,
    filter: defaultFilter,
    onCopy: () => {},
    onSkip: () => {},
    onDirExists: () => true,
  });

  await ensureDir(dst);
  const files = await fse.readdirSync(src);

  const promises = files.map(async (file) => {
    const srcItem = path.resolve(src, file);
    const dstItem = path.resolve(dst, file);
    const stat = fse.statSync(srcItem);
    const isFile = stat.isFile();
    const dstExists = fileExistsSync(dstItem);

    if (!options.filter(srcItem)) {
      return null;
    }

    if (isFile) {
      if (dstExists) {
        if (!options.clobber) {
          options.onSkip(dstItem);
          return null;
        }
        fse.removeSync(dstItem);
      }

      await copyFile(srcItem, dstItem, stat.mode);
      options.onCopy(dstItem);
    } else {
      let shouldCopyRecursively = true;
      if (dstExists) {
        shouldCopyRecursively = options.onDirExists(dstItem);
      }
      if (shouldCopyRecursively) {
        await copyDir(srcItem, dstItem, options);
      }
    }
  });

  return Promise.all(promises);
};

// Delete a directory.
const removeDir = (dir) => fse.remove(dir);

// Returns true if directory is empty, else false.
// Rejects if directory does not exist.
const isEmptyDir = (dir) => fse.readdir(dir).then((items) => _.isEmpty(items));
const isExistingEmptyDir = async (dir) =>
  fse.existsSync(dir) && !(await isEmptyDir(dir));

const makeTempDir = () => {
  let workdir;
  const tmpBaseDir = os.tmpdir();
  while (!workdir || fse.existsSync(workdir)) {
    workdir = path.join(tmpBaseDir, crypto.randomBytes(20).toString('hex'));
  }
  fse.mkdirSync(workdir);
  return workdir;
};

module.exports = {
  copyDir,
  deleteFile,
  ensureDir,
  fileExistsSync,
  isEmptyDir,
  isExistingEmptyDir,
  readFile,
  readFileStr,
  removeDir,
  validateFileExists,
  writeFile,
  copyFile,
  makeTempDir,
};
