import dynamic from 'next/dynamic';

const EarnPage = dynamic(() => import('../../content/EarnPage'), {
	ssr: true,
});

export default EarnPage;
