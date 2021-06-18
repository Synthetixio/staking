import useQuery from 'queries';
export { SynthTotalSupply, SynthsTotalSupplyData } from '@synthetixio/queries';

const useSynthsTotalSupplyQuery = () => {
	const { useSynthsTotalSupplyQuery } = useQuery();
	return useSynthsTotalSupplyQuery();
};

export default useSynthsTotalSupplyQuery;
