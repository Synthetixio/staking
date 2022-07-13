import dynamic from 'next/dynamic';

const LoansPage = dynamic(() => import('content/LoansPage'), { ssr: false });

export default LoansPage;
