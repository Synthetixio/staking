import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const BurnPage = dynamic(() => import('content/BurnPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default BurnPage;
