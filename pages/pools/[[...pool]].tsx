import dynamic from 'next/dynamic';

const PoolsPage = dynamic(() => import('content/PoolsPage'), { ssr: false });

export default PoolsPage;
