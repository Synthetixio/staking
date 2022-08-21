import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const LoansPage = dynamic(() => import('content/LoansPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default LoansPage;
