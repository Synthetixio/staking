#!/usr/bin/env node

const { exec } = require('child_process');

const { dependencies } = require('../package.json');

const [version = 'latest'] = process.argv.slice(2);

const synthetixDeps = []
  .concat(Object.keys(dependencies))
  .filter((name) => name.startsWith('@synthetixio/'));

async function execPromised(cmd, options) {
  return new Promise((resolve, reject) =>
    exec(cmd, { encoding: 'utf-8', stdio: 'pipe', ...options }, (error, data) =>
      error ? reject(error) : resolve(data.trim())
    )
  );
}
async function run() {
  const resolvedDeps = await Promise.all(
    synthetixDeps.map(async (name) => {
      const npmVersion = await execPromised(`npm info ${name}@${version} version`).then((x) =>
        x.trim()
      );
      if (!npmVersion) {
        return '';
      }
      const resolvedVersion = npmVersion.startsWith('0.0.0') ? npmVersion : `^${npmVersion}`;
      return `${name}@${resolvedVersion}`;
    })
  );

  console.log(resolvedDeps.join(' ').trim());
}

run();
