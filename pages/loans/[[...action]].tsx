import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const LoansPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "loans" */ 'content/LoansPage')),
	{ ssr: true }
);

export default LoansPage;
