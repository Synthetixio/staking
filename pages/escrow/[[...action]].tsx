import dynamic from 'next/dynamic';

const EscrowPage = dynamic(() => import('../../content/EscrowPage'), {
	ssr: true,
});

export default EscrowPage;
