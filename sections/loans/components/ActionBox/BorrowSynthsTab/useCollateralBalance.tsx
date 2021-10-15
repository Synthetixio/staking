import Wei, { wei } from '@synthetixio/wei';
import { ethers, Signer } from 'ethers';
import { useEffect, useState } from 'react';

export const useCollateralBalance = (
	signer: Signer | null,
	address: string | null,
	collateralContract: ethers.Contract | null,
	collateralIsETH: boolean
) => {
	const [collateralBalance, setCollateralBalance] = useState<Wei>(wei(0));

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			let balance = ethers.BigNumber.from(0);
			if (collateralIsETH) {
				if (signer) {
					balance = await signer.getBalance();
				}
			} else if (collateralContract && address) {
				balance = await collateralContract.balanceOf(address);
			}
			if (isMounted) setCollateralBalance(wei(balance.toString()));
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, collateralContract, address, signer]);
	return collateralBalance;
};
