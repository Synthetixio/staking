import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const MergeAccountsPage = dynamic(() => import('content/MergeAccountsPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default MergeAccountsPage;
