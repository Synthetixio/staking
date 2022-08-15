import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const HistoryPage = dynamic(() => import('content/HistoryPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default HistoryPage;
