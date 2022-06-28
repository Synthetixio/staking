import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const MergeAccountsPage = dynamic(
	() =>
		safeImport(
			() => import(/* webpackChunkName: "merge-accounts" */ '../../content/MergeAccountsPage')
		),
	{ ssr: true }
);

export default MergeAccountsPage;
