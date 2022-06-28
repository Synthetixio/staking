import dynamic from 'next/dynamic';

const DelegatePage = dynamic(() => import('../content/DelegatePage'), {
	ssr: true,
});

export default DelegatePage;
