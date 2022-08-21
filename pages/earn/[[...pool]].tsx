import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const EarnPage = dynamic(() => import('content/EarnPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default EarnPage;
