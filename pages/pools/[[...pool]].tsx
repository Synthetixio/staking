import dynamic from 'next/dynamic';

const PoolsPage = dynamic(() => import('../../content/PoolsPage'), {
	ssr: true,
});

export default PoolsPage;
