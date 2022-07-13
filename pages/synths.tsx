import dynamic from 'next/dynamic';

const SynthsPage = dynamic(() => import('content/SynthsPage'), { ssr: false });

export default SynthsPage;
