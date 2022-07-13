import dynamic from 'next/dynamic';

const L2MigratePage = dynamic(() => import('content/L2MigratePage'), { ssr: false });

export default L2MigratePage;
