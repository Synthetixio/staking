import dynamic from 'next/dynamic';

const EarnPage = dynamic(() => import('content/EarnPage'), { ssr: false });

export default EarnPage;
