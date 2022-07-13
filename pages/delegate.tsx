import dynamic from 'next/dynamic';

const DelegatePage = dynamic(() => import('content/DelegatePage'), { ssr: false });

export default DelegatePage;
