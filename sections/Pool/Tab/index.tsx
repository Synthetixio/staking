import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import Button from 'components/Button';
import GasSelector from 'components/GasSelector';
import { BigNumber, utils } from 'ethers';
import { useState } from 'react';
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
	// TODO @MF fetch balance when tx is mined
	fetchBalances,
}: PoolTabProps) {
	const { t } = useTranslation();
	const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
	const [amountToSend, setAmountToSend] = useState('');
	const { useSynthetixTxn } = useSynthetixQueries();

	// TODO @MF wait for PR to be merged and update the logic https://github.com/Synthetixio/synthetix/pull/1653/files
	const tx = useSynthetixTxn('StakingRewards', 'stake', [0]);

	const handleLiquidityButton = async () => {
		const amountToSendInBigNumber = utils.parseUnits(amountToSend, 18);
		if (approveFunc && allowanceAmount.lt(amountToSendInBigNumber)) {
			approveFunc(amountToSendInBigNumber);
		}
	};

	const needToApprove = () => {
		// prevents error when user types in a too big number
		const hasComma = amountToSend.includes(',');
		const indexOfComma = amountToSend.indexOf(',');
		const indexOfPoint = amountToSend.indexOf('.');
		if (
			amountToSend.slice(indexOfComma).length > 18 ||
			amountToSend.slice(indexOfPoint).length > 18
		) {
			return allowanceAmount.gt(
				utils.parseUnits(
					amountToSend.slice(0, hasComma ? indexOfComma : indexOfPoint + 18) || '0',
					18
				)
			);
		}
		return allowanceAmount.gt(utils.parseUnits(amountToSend || '0', 18));
	};

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
				<Button
					style={{ marginTop: '16px' }}
					variant="secondary"
					size="sm"
					onClick={() => {
						setAmountToSend(utils.formatUnits(action === 'add' ? balance : stakedTokens, 18));
					}}
				>
					{t('pool.tab.max')}
				</Button>
			</StyledInputWrapper>
			<DataRow>
				<GasSelector
					gasLimitEstimate={tx.gasLimit}
					onGasPriceChange={setGasPrice}
					optimismLayerOneFee={tx.optimismLayerOneFee}
				/>
			</DataRow>
			{action === 'remove' ? (
				<Button variant="primary" size="lg" disabled={!amountToSend}>
					{t('pool.tab.unstake')}
				</Button>
			) : (
				<Button
					variant="primary"
					size="lg"
					onClick={handleLiquidityButton}
					disabled={!amountToSend}
				>
					{needToApprove() ? t('pool.tab.stake') : t('pool.tab.approve')}
				</Button>
			)}

			<StyledButtonWrapper>
				<span>
					{t('pool.tab.reward-balance', { rewards: utils.formatUnits(rewardsToClaim, 18) })}
				</span>
				<Button
					variant="primary"
					size="lg"
					disabled={utils.formatUnits(rewardsToClaim, 18) === '0.0'}
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
