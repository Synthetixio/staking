import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import Wrapper from './Wrapper';
import { walletAddressState } from 'store/wallet';
import { useRecoilValue } from 'recoil';
import { SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';

type CloseProps = {
	loanId: number;
	loanTypeIsEth: boolean;
};

const Close: React.FC<CloseProps> = ({ loanId, loanTypeIsEth }) => {
	const address = useRecoilValue(walletAddressState);

	const [aAsset, setAAsset] = useState<string>('');
	const [bAsset, setBAsset] = useState<string>('');

	const [aAmountNumber, setAAmountNumber] = useState<string>('');
	const [bAmountNumber, setBAmountNumber] = useState<string>('');

	const [accruedInterest, setAccruedInterest] = useState<string>('');

	const onSetAAmount = () => {};
	const onSetBAmount = () => {};

	useEffect(() => {
		if (!address) return;

		let isMounted = true;
		const load = async () => {
			const {
				contracts: {
					CollateralStateEth: ethLoanStateContract,
					CollateralStateErc20: erc20LoanStateContract,
				},
			} = synthetix.js!;
			const contract = loanTypeIsEth ? ethLoanStateContract : erc20LoanStateContract;
			const loan = await contract.getLoan(address, loanId);
			if (isMounted) {
				setAAsset(SYNTH_BY_CURRENCY_KEY[loan.currency]);
				setBAsset(loanTypeIsEth ? 'ETH' : 'renBTC');
				setAAmountNumber(ethers.utils.formatUnits(loan.amount, 18));
				setBAmountNumber(ethers.utils.formatUnits(loan.collateral, 18));
				setAccruedInterest(loan.accruedInterest.toString());
			}
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [address]);

	return (
		<Wrapper
			{...{
				aLabel: 'loans.modify-loan.close.repay-label',
				aAsset,
				aAmountNumber,
				onSetAAmount,

				bLabel: 'loans.modify-loan.close.receive-label',
				bAsset,
				bAmountNumber,
				onSetBAmount,

				buttonLabel: 'loans.modify-loan.close.button-label',
			}}
		/>
	);
};

export default Close;
