import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const DelegatePage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "delegate" */ 'content/DelegatePage')),
	{ ssr: true }
);

export default DelegatePage;
