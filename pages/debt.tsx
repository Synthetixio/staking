import dynamic from 'next/dynamic';

const DebtPage = dynamic(() => import('../content/DebtPage'), {
	ssr: true,
});

export default DebtPage;
