import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { dSNXPoolContractOptimism } from 'constants/dhedge';
import Connector from 'containers/Connector';
import { constants, utils } from 'ethers';
import useGetDSnxBalance from 'hooks/useGetDSnxBalance';
import useGetNeedsApproval from 'hooks/useGetNeedsApproval';
import { useState } from 'react';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { StyledHedgeInput, StyledInputLabel } from './hedge-tab-ui-components';

export default function SellHedgeTabOptimism() {
	const { useContractTxn } = useSynthetixQueries();
	const [approveGasCost, setApproveGasCost] = useState<GasPrice | undefined>(undefined);
	const [withdrawnGasCost, setWithdrawGasCost] = useState<GasPrice | undefined>(undefined);
	const [amountToSend, setAmountToSend] = useState('');
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [sendMax, setSendMax] = useState<boolean>(false);
	const { walletAddress } = Connector.useContainer();
	const approveQuery = useGetNeedsApproval(
		dSNXPoolContractOptimism.address,
		dSNXPoolContractOptimism,
		walletAddress
	);
	const dSNXBalanceQuery = useGetDSnxBalance();
	const approveTx = useContractTxn(
		dSNXPoolContractOptimism,
		'approve',
		[dSNXPoolContractOptimism.address, constants.MaxUint256],
		approveGasCost,
		{
			enabled: Boolean(walletAddress && dSNXPoolContractOptimism),
			onSuccess: () => {
				setTxModalOpen(false);
				approveQuery.refetch();
			},
		}
	);
	const withdrawTx = useContractTxn(
		dSNXPoolContractOptimism,
		'withdrawSUSD',
		[dSNXPoolContractOptimism.address],
		withdrawnGasCost,
		{
			onSuccess: () => {
				setAmountToSend('');
				setTxModalOpen(false);
				dSNXBalanceQuery.refetch();
			},
			enabled: Boolean(approveQuery.data),
		}
	);
	return (
		<StyledSellHedgeContainer>
			<StyledInputLabel>dSNX</StyledInputLabel>
			<StyledHedgeInput
				type="number"
				min={0}
				disabled={approveTx.isLoading || withdrawTx.isLoading}
				placeholder={formatCryptoCurrency(dSNXBalanceQuery.data || wei(0), {
					maxDecimals: 1,
					minDecimals: 2,
				})}
				onChange={(e) => {
					try {
						const val = utils.parseUnits(e.target.value || '0', 18);
						if (val.gte(constants.MaxUint256)) return;
						setSendMax(false);
						setAmountToSend(e.target.value);
					} catch {
						console.error('Error while parsing input amount');
					}
				}}
				value={sendMax ? dSNXBalanceQuery.data?.toString(2) || '0' : amountToSend}
				autoFocus={true}
			/>
			<StyledInputLabel>SUSD</StyledInputLabel>
			<StyledHedgeInput></StyledHedgeInput>
		</StyledSellHedgeContainer>
	);
}
const StyledSellHedgeContainer = styled(FlexDivColCentered)`
	width: 100%;
	min-height: 100%;
`;
