import Wei, { wei } from '@synthetixio/wei';
import { Contract } from 'ethers';
import { useEffect, useState } from 'react';

export const useMinCollateralAmount = (loanContract: Contract | null) => {
	const [minCollateralAmount, setMinCollateralAmount] = useState<Wei>(wei(0));
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!loanContract) {
				return setMinCollateralAmount(wei(0));
			}

			const minCollateralAmount = await loanContract.minCollateral();

			if (isMounted) setMinCollateralAmount(wei(minCollateralAmount));
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [loanContract]);
	return minCollateralAmount;
};
