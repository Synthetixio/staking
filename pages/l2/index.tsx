import dynamic from 'next/dynamic';

const L2Page = dynamic(() => import('content/L2Page'), { ssr: false });

export default L2Page;
