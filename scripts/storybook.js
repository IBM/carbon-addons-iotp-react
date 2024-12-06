const { spawn } = require('child_process');
const { resolve } = require('path');
const arg = require('arg');

const args = arg({
  '--help': Boolean,
  '--build': Boolean,
});

if (args['--help']) {
  console.log(`
  storybook.js - monorepo helper to run storybook commands efficiently

  usage: node storybook.js [framework] [--build]

  By deafult the script will serve the react storybook.

  Flags:
  --build
    boolean flag. When passed will invoke build:storybook instead of storybook
  `);
  process.exit(0);
}

const storyPackages = ['react'];

let packageToRun = args._[0];

if (!packageToRun) {
  console.log(`no package specified, defaulting to react`);
  packageToRun = 'react';
}

if (!storyPackages.includes(packageToRun)) {
  console.log(`package '${packageToRun}' not found in '${storyPackages}' defaulting to react`);
  packageToRun = 'react';
}

const runCmd = (name, args = [], spawnConf = {}) => {
  return new Promise((resolve, reject) => {
    const conf = Object.assign(
      {},
      {
        stdio: 'inherit',
      },
      spawnConf
    );

    const cmd = spawn(name, args, conf);

    cmd.on('exit', (code) => {
      if (code !== 0) {
        reject(code);
      }

      resolve({
        code,
      });
    });
  });
};

const runYarn = (command, packageToRun) => {
  return runCmd('yarn', [command], {
    cwd: resolve('packages', packageToRun),
  });
};

const main = async () => {
  try {
    if (process.env.CI) {
      await runCmd('yarn', ['lerna', 'run', '--stream', 'postinstall']);
      await runCmd('yarn', ['lerna', 'link']);
    }
    if (args['--build']) {
      await runYarn('build:storybook', packageToRun);
    } else {
      await runYarn('storybook', packageToRun);
    }
  } catch (errorCode) {
    // check for code (may be null) and check if it has a non-zero value
    process.exit(errorCode);
  }
  // in all other cases we can just exit(0), node should handle re-throwing other signals for us
  process.exit(0);
};

main().catch(console.error);
