import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const L2Page = dynamic(() => import('content/L2Page'), {
	ssr: false,
	loading: GlobalLoader,
});

export default L2Page;
