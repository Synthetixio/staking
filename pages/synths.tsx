import dynamic from 'next/dynamic';

const SynthsPage = dynamic(() => import('../content/SynthsPage'), {
	ssr: true,
});

export default SynthsPage;
