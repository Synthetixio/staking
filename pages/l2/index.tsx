import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const L2Page = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "l2" */ 'content/L2Page')),
	{ ssr: true }
);

export default L2Page;
