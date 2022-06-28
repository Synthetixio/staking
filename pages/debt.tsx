import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const DebtPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "debt" */ 'content/DebtPage')),
	{ ssr: true }
);

export default DebtPage;
