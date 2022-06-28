import dynamic from 'next/dynamic';

const MergeAccountsPage = dynamic(() => import('../../content/MergeAccountsPage'), {
	ssr: true,
});

export default MergeAccountsPage;
