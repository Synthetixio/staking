import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const GovPage = dynamic(() => import('content/GovPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default GovPage;
