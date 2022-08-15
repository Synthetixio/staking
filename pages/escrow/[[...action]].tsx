import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const EscrowPage = dynamic(() => import('content/EscrowPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default EscrowPage;
