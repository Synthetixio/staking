import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';
// import synthetix from '@synthetixio/contracts-interface';
// import

const StakingPage = dynamic(() => import('content/StakingPage'), {
	ssr: true,
	loading: GlobalLoader,
});

export const getServerSideProps = async () => {
	const thing = fetch('http://localhost:3000/api').then((res) => res.json());

	return {
		props: thing,
	};
};

export default StakingPage;
