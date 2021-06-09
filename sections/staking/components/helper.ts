import Wei from '@synthetixio/wei';
import { NumericValue, toBigNumber, zeroBN, maxBN } from 'utils/formatters/number';

export function getMintAmount(targetCRatio: Wei, stakeAmount: WeiSource, SNXPrice: Wei): Wei {
	if (!stakeAmount || !targetCRatio || !SNXPrice) return wei(0);
	return wei(stakeAmount).mul(targetCRatio).mul(SNXPrice);
}

export function getStakingAmount(targetCRatio: Wei, mintAmount: WeiSource, SNXPrice: Wei): Wei {
	if (!mintAmount || !targetCRatio || !SNXPrice) return wei(0);
	return wei(mintAmount).div(targetCRatio).div(SNXPrice);
}

export function getTransferableAmountFromMint(balance: Wei, stakedValue: Wei): Wei {
	if (!balance || !stakedValue) return wei(0);
	return maxBN(balance.sub(stakedValue), zeroBN);
}

export function getTransferableAmountFromBurn(
	amountToBurn: WeiSource,
	debtEscrowBalance: Wei,
	targetCRatio: Wei,
	SNXPrice: Wei,
	transferable: Wei
): Wei {
	if (!amountToBurn) return wei(0);
	return transferable.add(
		maxBN(wei(amountToBurn).sub(debtEscrowBalance).div(targetCRatio).div(SNXPrice), zeroBN)
	);
}

export function sanitiseValue(value: Wei) {
	if (value.isNegative() || value.isNaN() || !value.isFinite()) {
		return zeroBN;
	} else {
		return value;
	}
}
