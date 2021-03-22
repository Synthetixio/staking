import { QueryResult } from 'react-query';
import { useRecoilValue } from 'recoil';
import useEscrowDataQueryV1 from 'queries/escrow/useEscrowDataQueryV1';
import useEscrowDataQueryV2 from 'queries/escrow/useEscrowDataQueryV2';
import { networkState } from 'store/wallet';

export type EscrowData = {
	claimableAmount: number;
	schedule: Schedule;
	totalEscrowed: number;
	totalVested: number;
	totalBalancePendingMigration?: number;
	claimableEntryIds?: number[];
	claimableEntryIdsInChunk?: number[][];
};

export type Schedule = Array<
	| {
			quantity: number;
			date: Date;
	  }
	| []
>;

function useEscrowDataQueryWrapper(): QueryResult<EscrowData, unknown> {
	const rewardEscrowQueryV2 = useEscrowDataQueryV2();
	const rewardEscrowQueryV1 = useEscrowDataQueryV1();
	const network = useRecoilValue(networkState);

	const isL2 = network?.useOvm ?? false;

	return isL2 || !rewardEscrowQueryV1?.data?.totalBalancePendingMigration
		? rewardEscrowQueryV2
		: rewardEscrowQueryV1;
}

export default useEscrowDataQueryWrapper;
