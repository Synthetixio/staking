import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const PoolsPage = dynamic(() => import('content/PoolsPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default PoolsPage;
