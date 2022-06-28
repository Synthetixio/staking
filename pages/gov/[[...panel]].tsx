import dynamic from 'next/dynamic';

const GovPage = dynamic(() => import('../../content/GovPage'), {
	ssr: true,
});

export default GovPage;
