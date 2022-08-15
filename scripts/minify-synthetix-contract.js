const fs = require('fs');
const ethers = require('ethers');

module.exports = function generate({ networks, out }) {
  networks.forEach((network) => {
    const deployment = require(`synthetix/publish/deployed/${network}/deployment.json`);

    Object.keys(deployment.targets).forEach((key) => {
      const { name, source, address } = deployment.targets[key];
      deployment.targets[key] = { name, source, address };
    });

    Object.keys(deployment.sources).forEach((key) => {
      const source = deployment.sources[key];
      const iface = new ethers.utils.Interface(source.abi);
      const abi = iface.format(ethers.utils.FormatTypes.full);
      deployment.sources[key] = { abi };
    });

    fs.writeFileSync(`${out}/${network}.json`, JSON.stringify(deployment, null, 2));
  });
};
