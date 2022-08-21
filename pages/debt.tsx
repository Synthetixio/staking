import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const DebtPage = dynamic(() => import('content/DebtPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default DebtPage;
