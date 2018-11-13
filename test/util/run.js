'use strict';
const cp = require('child_process');
const path = require('path');
const binPath = path.join(__dirname, '../..', 'bin', 'run.js');

module.exports = function run(extraArgs, options) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let args = [
      '--hostType', 'node',
      '--hostPath', process.execPath,
      '--timeout', '2000',
      ...[ '-r', options.reporter ],
    ].concat(extraArgs);

    const cwd = options && options.cwd;
    const child = cp.fork(binPath, args, { cwd, silent: true });

    child.stdout.on('data', data => { stdout += data });
    child.stderr.on('data', data => { stderr += data });
    child.on('exit', () => {
      if (stderr) {
        return reject(new Error(`Got stderr: ${stderr.toString()}`));
      }

      try {
        let records = options.reporter === 'json' ?
          JSON.parse(stdout) :
          stdout.trim().split('\n');

        resolve({
          args,
          options,
          records,
        });
      } catch(e) {
        reject(e);
      }
    });
  });
};
