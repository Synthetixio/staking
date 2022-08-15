import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const SocketBridge = dynamic(() => import('content/BridgePage'), {
  ssr: false,
  loading: GlobalLoader,
});

export default SocketBridge;
