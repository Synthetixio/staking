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
	approveFunc?: (amount: BigNumber) => Promise<boolean | undefined>;
}
export default function PoolTab({
	action,
	balance,
	rewardsToClaim,
	allowanceAmount,
	approveFunc,
}: PoolTabProps) {
	const { t } = useTranslation();
	const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
	const [amountToSend, setAmountToSend] = useState(utils.formatUnits(balance, 18));
	const { useSynthetixTxn } = useSynthetixQueries();

	// TODO @MF wait for PR to be merged and update the logic https://github.com/Synthetixio/synthetix/pull/1653/files
	const tx = useSynthetixTxn('StakingRewards', 'stake', [0]);

	const handleLiquidityButton = async () => {
		const amountToSendInBigNumber = utils.parseUnits(amountToSend, 18);
		if (approveFunc && allowanceAmount.lt(amountToSendInBigNumber)) {
			approveFunc(amountToSendInBigNumber);
		}
	};

	return (
		<StyledPoolTabWrapper>
			<StyledInputWrapper>
				<StyledInput
					placeholder={utils.formatUnits(balance, 18)}
					type="number"
					maxLength={12}
					onChange={(e) => {
						setAmountToSend(e.target.value);
					}}
					value={amountToSend}
				/>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => {
						setAmountToSend(utils.formatUnits(balance, 18));
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
				<Button variant="primary" size="lg" disabled={balance.toString() === '0'}>
					{t('pool.tab.unstake')}
				</Button>
			) : (
				<Button
					variant="primary"
					size="lg"
					disabled={balance.toString() === '0'}
					onClick={handleLiquidityButton}
				>
					{allowanceAmount.gt(utils.parseUnits(amountToSend, 18))
						? t('pool.tab.stake')
						: t('pool.tab.approve')}
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
	height: 100%;
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
