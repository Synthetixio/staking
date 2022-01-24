import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import Button from 'components/Button';
import GasSelector from 'components/GasSelector';
import { BigNumber, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { DataRow, StyledInput } from '../../staking/components/common';

export interface PoolTabProps {
	action: 'add' | 'remove';
	balance: BigNumber;
	rewardsToClaim: BigNumber;
	allowanceAmount: BigNumber;
	stakedTokens: BigNumber;
	approveFunc?: (amount: BigNumber) => Promise<boolean | undefined>;
	fetchBalances: () => void;
}

export default function PoolTab({
	action,
	balance,
	rewardsToClaim,
	allowanceAmount,
	approveFunc,
	stakedTokens,
	fetchBalances,
}: PoolTabProps) {
	const { t } = useTranslation();
	const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
	const [gasPriceClaimRewards, setGasPriceClaimRewards] = useState<GasPrice | undefined>(undefined);
	const [needToApprove, setNeedToApprove] = useState(true);
	const [error, setError] = useState('');
	const [amountToSend, setAmountToSend] = useState('');
	const { useSynthetixTxn } = useSynthetixQueries();
	const txn = useSynthetixTxn(
		'StakingRewardsSNXWETHUniswapV3',
		action === 'add' ? 'stake' : 'withdraw',
		[utils.parseUnits(amountToSend ? amountToSend : '0', 18)],
		gasPrice,
		{
			enabled: utils.parseUnits(amountToSend ? amountToSend : '0', 18).gt(BigNumber.from(0)),
			onSettled: () => {
				fetchBalances();
			},
		}
	);

	const claimRewardsTx = useSynthetixTxn(
		'StakingRewardsSNXWETHUniswapV3',
		'getReward',
		[],
		gasPriceClaimRewards,
		{
			enabled: true,
			onSettled: () => {
				fetchBalances();
			},
		}
	);

	const handleTxButton = async () => {
		if (!error) {
			if (needToApprove && approveFunc) {
				await approveFunc(utils.parseUnits(amountToSend, 18));
				fetchBalances();
			} else {
				txn.mutate();
			}
		}
	};
	const allowanceAmountString = allowanceAmount.toString();
	useEffect(() => {
		if (amountToSend) {
			setError('');
			try {
				const allowanceAmountBigNumber = BigNumber.from(allowanceAmountString);
				setNeedToApprove(utils.parseUnits(amountToSend, 18).gt(allowanceAmountBigNumber));
			} catch (error) {
				setError('Number is too big');
			}
		}
	}, [amountToSend, allowanceAmountString]);

	return (
		<StyledPoolTabWrapper>
			<StyledInputWrapper>
				<StyledInput
					placeholder={utils.formatUnits(action === 'add' ? balance : stakedTokens, 18)}
					type="number"
					onChange={(e) => {
						setAmountToSend(e.target.value || '');
					}}
					value={amountToSend}
				/>
				<StyledMaxButton
					variant="secondary"
					size="sm"
					disabled={action === 'add' ? balance.lte(0) : stakedTokens.lte(0)}
					onClick={() => {
						setAmountToSend(utils.formatUnits(action === 'add' ? balance : stakedTokens, 18));
					}}
				>
					{t('pool.tab.max')}
				</StyledMaxButton>
			</StyledInputWrapper>
			<DataRow>
				<GasSelector
					gasLimitEstimate={txn.gasLimit}
					onGasPriceChange={setGasPrice}
					optimismLayerOneFee={txn.optimismLayerOneFee}
					altVersion
				/>
			</DataRow>
			{action === 'remove' ? (
				<Button
					variant="primary"
					size="lg"
					disabled={Number(amountToSend || 0) <= 0}
					onClick={handleTxButton}
				>
					{t('pool.tab.unstake')}
				</Button>
			) : (
				<Button
					variant="primary"
					size="lg"
					onClick={handleTxButton}
					disabled={Number(amountToSend || 0) <= 0 || !!error}
				>
					{!!error ? error : needToApprove ? t('pool.tab.approve') : t('pool.tab.stake')}
				</Button>
			)}

			<StyledButtonWrapper>
				<span>
					{t('pool.tab.reward-balance', { rewards: utils.formatUnits(rewardsToClaim, 18) })}
				</span>
				<GasSelector
					gasLimitEstimate={claimRewardsTx.gasLimit}
					onGasPriceChange={setGasPriceClaimRewards}
					optimismLayerOneFee={claimRewardsTx.optimismLayerOneFee}
					altVersion
				/>
				<Button
					variant="primary"
					size="lg"
					disabled={utils.formatUnits(rewardsToClaim, 18) === '0.0'}
					onClick={() => claimRewardsTx.mutate()}
				>
					{t('pool.tab.claim')}
				</Button>
			</StyledButtonWrapper>
		</StyledPoolTabWrapper>
	);
}

const StyledPoolTabWrapper = styled.section`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 450px;
`;

const StyledButtonWrapper = styled.div`
	margin-top: auto;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	> * {
		margin: 8px;
	}
`;

const StyledInputWrapper = styled(FlexDivCentered)`
	align-items: center;
`;

const StyledMaxButton = styled(Button)`
	margin-top: 16px;
`;
