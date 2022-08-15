import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const DashboardPage = dynamic(() => import('content/DashboardPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default DashboardPage;
