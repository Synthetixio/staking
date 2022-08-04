import { NextApiRequest, NextApiResponse } from 'next';
// import { Synths } from '@synthetixio/contracts-interface';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.status(200).json({ hello: 'world' });
}
