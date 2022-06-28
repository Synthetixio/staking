import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const PoolsPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "pools" */ 'content/PoolsPage')),
	{ ssr: true }
);

export default PoolsPage;
