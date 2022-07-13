import dynamic from 'next/dynamic';

const MergeAccountsPage = dynamic(() => import('content/MergeAccountsPage'), { ssr: false });

export default MergeAccountsPage;
