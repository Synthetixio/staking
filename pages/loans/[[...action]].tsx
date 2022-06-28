import dynamic from 'next/dynamic';

const LoansPage = dynamic(() => import('../../content/LoansPage'), {
	ssr: true,
});

export default LoansPage;
