import dynamic from 'next/dynamic';

const StakingPage = dynamic(() => import('../../content/StakingPage'), {
	ssr: true,
});

export default StakingPage;
