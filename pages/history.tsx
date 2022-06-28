import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const HistoryPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "history" */ '../content/HistoryPage')),
	{ ssr: true }
);

export default HistoryPage;
