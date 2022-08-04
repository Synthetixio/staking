import { NextApiRequest, NextApiResponse } from 'next';
import * as MainnetSynths from '@synthetixio/contracts/build/mainnet/synths';
import * as MainnetOvmSynths from '@synthetixio/contracts/build/mainnet-ovm/synths';
import * as KovanSynths from '@synthetixio/contracts/build/kovan/synths';
import * as KovanOvmSynths from '@synthetixio/contracts/build/kovan-ovm/synths';

import * as MainnetAddress from '@synthetixio/contracts/build/mainnet/deployment/sources/Synthetix';
import * as MainnetABI from '@synthetixio/contracts/build/mainnet/deployment/targets/Synthetix';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	console.log(JSON.stringify(MainnetSynths.Synths));
	const synths = {
		mainnet: MainnetSynths,
		kovan: KovanSynths,
		'mainnet-ovm': MainnetOvmSynths,
		'kovan-ovm': KovanOvmSynths,
	};
	res.status(200).json(synths);
}
