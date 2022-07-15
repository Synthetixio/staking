import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const L2MigratePage = dynamic(() => import('content/L2MigratePage'), {
	ssr: false,
	loading: GlobalLoader,
});

export default L2MigratePage;
