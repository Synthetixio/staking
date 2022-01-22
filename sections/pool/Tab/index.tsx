import { NetworkId, synthetix } from '@synthetixio/contracts-interface';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import Button from 'components/Button';
import GasSelector from 'components/GasSelector';
import Connector from 'containers/Connector';
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
	const [needToApprove, setNeedToApprove] = useState(true);
	const [error, setError] = useState('');
	const [amountToSend, setAmountToSend] = useState('');
	const { useSynthetixTxn } = useSynthetixQueries();
	const { signer } = Connector.useContainer();
	const snxjs = synthetix({ networkId: NetworkId['Mainnet-Ovm'], useOvm: true, signer: signer! });
	const tx = useSynthetixTxn('StakingRewards', action === 'add' ? 'mint' : 'withdraw');

	const handleLiquidityButton = async () => {
		if (!error) {
			if (needToApprove && approveFunc) {
				approveFunc(utils.parseUnits(amountToSend, 18));
			} else {
				const tx = await snxjs.contracts.StakingRewardsSNXWETHUniswapV3.stake(
					utils.parseUnits(amountToSend, 18)
				);
				await tx.wait(1);
			}
			fetchBalances();
		}
	};

	const handleUnStake = async () => {
		const tx = await snxjs.contracts.StakingRewardsSNXWETHUniswapV3.withdraw(
			utils.parseUnits(amountToSend, 18)
		);
		await tx.wait(1);
		fetchBalances();
	};

	useEffect(() => {
		if (amountToSend) {
			setError('');
			try {
				setNeedToApprove(utils.parseUnits(amountToSend, 18).gt(allowanceAmount));
			} catch (error) {
				setError('Number is too big');
			}
		}
	}, [amountToSend]);

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
				<Button variant="primary" size="lg" disabled={!amountToSend} onClick={handleUnStake}>
					{t('pool.tab.unstake')}
				</Button>
			) : (
				<Button
					variant="primary"
					size="lg"
					onClick={handleLiquidityButton}
					disabled={!amountToSend || !!error}
				>
					{!!error ? error : needToApprove ? t('pool.tab.approve') : t('pool.tab.stake')}
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
