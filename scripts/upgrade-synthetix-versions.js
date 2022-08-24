#!/usr/bin/env node

const { exec } = require('child_process');
const { writeFile, readFile } = require('fs/promises');

const [version = 'latest'] = process.argv.slice(2);

async function execPromised(cmd, options) {
  return new Promise((resolve, reject) =>
    exec(cmd, { encoding: 'utf-8', stdio: 'pipe', ...options }, (error, data) =>
      error ? reject(error) : resolve(data.trim())
    )
  );
}

async function run() {
  const packageJson = JSON.parse(await readFile(`${__dirname}/../package.json`, 'utf-8'));

  const synthetixDeps = []
    .concat(Object.keys(packageJson.dependencies))
    .filter((name) => name.startsWith('@synthetixio/'));

  const npmVersions = await Promise.all(
    synthetixDeps.map(async (name) => [
      name,
      await execPromised(`npm info ${name}@${version} version`),
    ])
  );

  const resolvedDeps = Object.fromEntries(
    npmVersions
      .map(([name, version]) => [name, version.trim()])
      .filter(([name, version]) => Boolean(version))
      .map(([name, version]) => [name, version.startsWith('0.0.0') ? version : `^${version}`])
  );

  const dependencies = Object.fromEntries(
    Object.entries(Object.assign(packageJson.dependencies, resolvedDeps)).sort(([a], [b]) =>
      a.localeCompare(b, 'en')
    )
  );
  const resolutions = Object.fromEntries(
    Object.entries(Object.assign(packageJson.resolutions, resolvedDeps)).sort(([a], [b]) =>
      a.localeCompare(b, 'en')
    )
  );
  Object.assign(packageJson, { dependencies, resolutions });

  console.log(resolvedDeps);

  await writeFile(`${__dirname}/../package.json`, JSON.stringify(packageJson, null, 2), 'utf-8');
}

run();
