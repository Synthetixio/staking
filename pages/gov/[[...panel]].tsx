import dynamic from 'next/dynamic';

const GovPage = dynamic(() => import('content/GovPage'), { ssr: false });

export default GovPage;
