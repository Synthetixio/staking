export function getMintAmount(targetCRatio: number, stakeAmount: string, SNXPrice: number): number {
	if (!stakeAmount || !targetCRatio || !SNXPrice) return 0;
	return Number(stakeAmount) * targetCRatio * SNXPrice;
}
