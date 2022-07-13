import dynamic from 'next/dynamic';

const EscrowPage = dynamic(() => import('content/EscrowPage'), { ssr: false });

export default EscrowPage;
