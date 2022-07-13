import dynamic from 'next/dynamic';

const DebtPage = dynamic(() => import('content/DebtPage'), { ssr: false });

export default DebtPage;
