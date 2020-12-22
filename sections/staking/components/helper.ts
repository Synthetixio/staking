import BigNumber from 'bignumber.js';
import { NumericValue, toBigNumber } from 'utils/formatters/number';

export function getMintAmount(
	targetCRatio: BigNumber,
	stakeAmount: NumericValue,
	SNXPrice: BigNumber
): BigNumber {
	if (!stakeAmount || !targetCRatio || !SNXPrice) return toBigNumber(0);
	return toBigNumber(stakeAmount).multipliedBy(targetCRatio).multipliedBy(SNXPrice);
}

export function getStakingAmount(
	targetCRatio: BigNumber,
	mintAmount: NumericValue,
	SNXPrice: BigNumber
): BigNumber {
	if (!mintAmount || !targetCRatio || !SNXPrice) return toBigNumber(0);
	return toBigNumber(mintAmount).dividedBy(targetCRatio).dividedBy(SNXPrice);
}
