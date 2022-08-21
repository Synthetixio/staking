import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const MigrateEscrowPage = dynamic(() => import('content/MigrateEscrowPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default MigrateEscrowPage;
