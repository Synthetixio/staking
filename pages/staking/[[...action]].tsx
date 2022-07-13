import dynamic from 'next/dynamic';

const StakingPage = dynamic(() => import('content/StakingPage'), { ssr: false });

export default StakingPage;
