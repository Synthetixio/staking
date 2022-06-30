import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const L2MigratePage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "l2-migrate" */ 'content/L2MigratePage')),
	{ ssr: true }
);

export default L2MigratePage;
