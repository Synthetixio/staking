import { VOTE_CODE, NOMINATION_CODE } from '@synthetixio/queries';

export const isAnyElectionInNomination = (
  periodStatuses?: { currentPeriodLabel: string; code: number }[]
) => periodStatuses?.some(({ code }) => code === NOMINATION_CODE) ?? false;
export const isAnyElectionInVoting = (
  periodStatuses?: { currentPeriodLabel: string; code: number }[]
) => periodStatuses?.some(({ code }) => code === VOTE_CODE) ?? false;
