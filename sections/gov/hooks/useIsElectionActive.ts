import { useMemo } from 'react';
import useLatestElectionsQuery from 'queries/gov/useLatestElectionsQuery';

export const useIsElectionActive = () => {
	const latestCouncilElection = useLatestElectionsQuery();

	const electionActive = useMemo(() => {
		if (latestCouncilElection.data && latestCouncilElection.data.length === 3) {
			return true;
		} else {
			return false;
		}
	}, [latestCouncilElection]);

	return electionActive;
};

export default useIsElectionActive;
