import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const SynthsPage = dynamic(() => import('content/SynthsPage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default SynthsPage;
