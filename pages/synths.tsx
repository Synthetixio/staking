import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const SynthsPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "synths" */ '../content/SynthsPage')),
	{ ssr: true }
);

export default SynthsPage;
