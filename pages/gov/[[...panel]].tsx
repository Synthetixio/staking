import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const GovPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "gov" */ '../../content/GovPage')),
	{ ssr: true }
);

export default GovPage;
