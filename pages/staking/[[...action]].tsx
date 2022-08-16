import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const StakingPage = dynamic(() => import('content/StakingPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default StakingPage;
