import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const StakingPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "staking" */ '../../content/StakingPage')),
	{ ssr: true }
);

export default StakingPage;
