export function getMintAmount(targetCRatio: number, stakeAmount: string, SNXPrice: number): number {
	if (!stakeAmount || !targetCRatio || !SNXPrice) return 0;
	return Number(stakeAmount) * targetCRatio * SNXPrice;
}

export function getStakingAmount(
	targetCRatio: number,
	mintAmount: string,
	SNXPrice: number
): number {
	if (!mintAmount || !targetCRatio || !SNXPrice) return 0;
	return Number(mintAmount) / targetCRatio / SNXPrice;
}
