import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const EarnPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "earn" */ '../../content/EarnPage')),
	{ ssr: true }
);

export default EarnPage;
