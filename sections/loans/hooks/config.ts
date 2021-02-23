import React from 'react';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import synthetix from 'lib/synthetix';
import { LOAN_TYPE_ERC20, LOAN_TYPE_ETH } from 'sections/loans/constants';
import { toBig } from 'utils/formatters/big-number';

const SECONDS_IN_A_YR = 365 * 24 * 60 * 60;

export function useConfig() {
	const isAppReady = useRecoilValue(appReadyState);

	const [interestRate, setInterestRate] = React.useState(toBig('0'));
	const [issueFeeRates, setIssueFeeRates] = React.useState({
		[LOAN_TYPE_ERC20]: toBig('0'),
		[LOAN_TYPE_ETH]: toBig('0'),
	});
	const [interactionDelays, setInteractionDelays] = React.useState({
		[LOAN_TYPE_ERC20]: toBig('0'),
		[LOAN_TYPE_ETH]: toBig('0'),
	});

	React.useEffect(() => {
		if (!isAppReady) return;

		let isMounted = true;
		const load = async () => {
			const {
				contracts: {
					CollateralEth: ethLoanContract,
					CollateralErc20: erc20LoanContract,
					CollateralManager: collateralManagerContract,
				},
			} = synthetix.js!;

			const [
				[borrowRate],
				//
				erc20BorrowIssueFeeRate,
				ethBorrowIssueFeeRate,
				//
				erc20InteractionDelay,
				ethInteractionDelay,
			] = await Promise.all([
				collateralManagerContract.getBorrowRate(),
				//
				erc20LoanContract.issueFeeRate(),
				ethLoanContract.issueFeeRate(),
				//
				erc20LoanContract.interactionDelay(),
				ethLoanContract.interactionDelay(),
			]);
			if (isMounted) {
				const perYr = SECONDS_IN_A_YR * 1e2 * (1 / 1e18);
				setInterestRate(toBig(borrowRate).mul(perYr));
				setIssueFeeRates({
					[LOAN_TYPE_ERC20]: toBig(erc20BorrowIssueFeeRate).mul(1e2 / 1e18),
					[LOAN_TYPE_ETH]: toBig(ethBorrowIssueFeeRate).mul(1e2 / 1e18),
				});
				setInteractionDelays({
					[LOAN_TYPE_ERC20]: erc20InteractionDelay,
					[LOAN_TYPE_ETH]: ethInteractionDelay,
				});
			}
		};

		load();
		return () => {
			isMounted = false;
		};
	}, [isAppReady]);
	return {
		interestRate,
		issueFeeRates,
		interactionDelays,
	};
}
