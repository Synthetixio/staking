const NOMINATION_CODE = 1;
const VOTE_CODE = 2;

export const isAnyElectionInNomination = (
	periodStatuses?: { currentPeriodLabel: string; code: number }[]
) => periodStatuses?.some(({ code }) => code === NOMINATION_CODE) ?? false;
export const isAnyElectionInVoting = (
	periodStatuses?: { currentPeriodLabel: string; code: number }[]
) => periodStatuses?.some(({ code }) => code === VOTE_CODE) ?? false;
