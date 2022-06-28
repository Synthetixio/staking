import dynamic from 'next/dynamic';

const L2Page = dynamic(() => import('../../content/L2Page'), {
	ssr: true,
});

export default L2Page;
