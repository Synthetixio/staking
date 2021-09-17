import Wei, { wei, WeiSource } from '@synthetixio/wei';

export function getMintAmount(targetCRatio: Wei, stakeAmount: WeiSource, SNXPrice: Wei): Wei {
	if (!stakeAmount || targetCRatio.eq(0) || SNXPrice.eq(0)) return wei(0);
	return wei(stakeAmount).mul(targetCRatio).mul(SNXPrice);
}

export function getStakingAmount(targetCRatio: Wei, mintAmount: WeiSource, SNXPrice: Wei): Wei {
	if (!mintAmount || targetCRatio.eq(0) || SNXPrice.eq(0)) return wei(0);
	return wei(mintAmount).div(targetCRatio).div(SNXPrice);
}

export function getTransferableAmountFromMint(balance: Wei, stakedValue: Wei): Wei {
	if (!balance || !stakedValue) return wei(0);
	return Wei.max(balance.sub(stakedValue), wei(0));
}

export function getTransferableAmountFromBurn(
	amountToBurn: WeiSource,
	debtEscrowBalance: Wei,
	targetCRatio: Wei,
	SNXPrice: Wei,
	transferable: Wei
): Wei {
	if (!amountToBurn || targetCRatio.eq(0) || SNXPrice.eq(0)) return wei(0);
	return transferable.add(
		Wei.max(wei(amountToBurn).sub(debtEscrowBalance).div(targetCRatio).div(SNXPrice), wei(0))
	);
}

export function sanitiseValue(value: Wei) {
	if (value.lt(0)) {
		return wei(0);
	} else {
		return value;
	}
}
