import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const DelegatePage = dynamic(() => import('content/DelegatePage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default DelegatePage;
