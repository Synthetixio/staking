import { FC, useState, ReactNode, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { Svg } from 'react-optimized-image';

import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import GasSelector from 'components/GasSelector';
import synthetix from 'lib/synthetix';
import { StyledInput } from 'components/Input/NumericInput';
import { formatCryptoCurrency } from 'utils/formatters/number';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import Etherscan from 'containers/Etherscan';
import Connector from 'containers/Connector';
import { curvepoolRewards } from 'contracts';

import {
	ExternalLink,
	FlexDivCentered,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
} from 'styles/common';
import { CurrencyKey, CryptoCurrency, Synths } from 'constants/currency';
import { Transaction } from 'constants/network';
import Notify from 'containers/Notify';
import TxState from 'sections/earn/TxState';

import {
	TotalValueWrapper,
	Subtext,
	Value,
	StyledButton,
	GreyHeader,
	WhiteSubheader,
	Divider,
	VerifyButton,
	DismissButton,
	ButtonSpacer,
	GreyText,
	LinkText,
} from '../../common';

export const getContract = (stakedAsset: CurrencyKey, signer: ethers.Signer | null) => {
	const { contracts } = synthetix.js!;
	if (stakedAsset === Synths.iBTC) {
		return contracts.StakingRewardsiBTC;
	} else if (stakedAsset === Synths.iETH) {
		return contracts.StakingRewardsiETH;
	} else if (stakedAsset === CryptoCurrency.CurveLPToken && signer != null) {
		return new ethers.Contract(
			curvepoolRewards.address,
			curvepoolRewards.abi,
			signer as ethers.Signer
		);
	} else {
		throw new Error('unrecognizable asset or signer not set');
	}
};

type StakeTabProps = {
	icon: ReactNode;
	isStake: boolean;
	stakedAsset: CurrencyKey;
	userBalance: number;
	staked: number;
};

const StakeTab: FC<StakeTabProps> = ({ icon, stakedAsset, isStake, userBalance, staked }) => {
	const { t } = useTranslation();
	const [amount, setAmount] = useState<number | null>(null);
	const { monitorHash } = Notify.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const { signer } = Connector.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const link =
		etherscanInstance != null && txHash != null ? etherscanInstance.txLink(txHash) : undefined;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js && amount != null && amount > 0) {
				try {
					setError(null);
					const contract = getContract(stakedAsset, signer);
					let gasEstimate = await getGasEstimateForTransaction(
						[synthetix.js.utils.parseEther(amount.toString())],
						isStake ? contract.estimateGas.stake : contract.estimateGas.withdraw
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [amount, isStake, stakedAsset, signer]);

	const handleStake = useCallback(() => {
		async function stake() {
			if (synthetix && synthetix.js && amount != null && amount > 0) {
				try {
					setError(null);
					setTxModalOpen(true);
					const contract = getContract(stakedAsset, signer);

					const formattedStakeAmount = synthetix.js.utils.parseEther(amount.toString());
					const gasLimit = await getGasEstimateForTransaction(
						[formattedStakeAmount],
						isStake ? contract.estimateGas.stake : contract.estimateGas.withdraw
					);
					let transaction: ethers.ContractTransaction;
					if (isStake) {
						transaction = await contract.stake(formattedStakeAmount, {
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit,
						});
					} else {
						transaction = await contract.withdraw(formattedStakeAmount, {
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit,
						});
					}

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorHash({
							txHash: transaction.hash,
							onTxConfirmed: () => setTransactionState(Transaction.SUCCESS),
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setError(e.message);
				}
			}
		}
		stake();
	}, [gasPrice, isStake, monitorHash, amount, signer, stakedAsset]);

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				isStakingPanel={true}
				isStakingPanelWaitingScreen={true}
				description={null}
				title={
					isStake ? t('earn.actions.stake.in-progress') : t('earn.actions.unstake.in-progress')
				}
				content={
					<StakeTxContainer>
						<Svg src={PendingConfirmation} />
						<GreyHeader>
							{isStake ? t('earn.actions.stake.staking') : t('earn.actions.unstake.unstaking')}
						</GreyHeader>
						<WhiteSubheader>
							{isStake
								? t('earn.actions.stake.amount', {
										amount,
										asset: stakedAsset,
								  })
								: t('earn.actions.unstake.amount', {
										amount,
										asset: stakedAsset,
								  })}
						</WhiteSubheader>
						<StakeDivider />
						<GreyText>{t('earn.actions.tx.notice')}</GreyText>
						<ExternalLink href={link}>
							<LinkText>{t('earn.actions.tx.link')}</LinkText>
						</ExternalLink>
					</StakeTxContainer>
				}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<TxState
				isStakingPanel={true}
				description={null}
				title={isStake ? t('earn.actions.stake.success') : t('earn.actions.unstake.success')}
				content={
					<StakeTxContainer>
						<Svg src={Success} />
						<GreyHeader>
							{isStake ? t('earn.actions.stake.staked') : t('earn.actions.unstake.withdrew')}
						</GreyHeader>
						<WhiteSubheader>
							{isStake
								? t('earn.actions.stake.amount', {
										amount,
										asset: stakedAsset,
								  })
								: t('earn.actions.unstake.amount', {
										amount,
										asset: stakedAsset,
								  })}
						</WhiteSubheader>
						<StakeDivider />
						<ButtonSpacer isStakingPanel={true}>
							{link ? (
								<ExternalLink href={link}>
									<VerifyButton isStakingPanel={true}>{t('earn.actions.tx.verify')}</VerifyButton>
								</ExternalLink>
							) : null}
							<DismissButton
								isStakingPanel={true}
								variant="secondary"
								onClick={() => setTransactionState(Transaction.PRESUBMIT)}
							>
								{t('earn.actions.tx.dismiss')}
							</DismissButton>
						</ButtonSpacer>
					</StakeTxContainer>
				}
			/>
		);
	}

	return (
		<>
			<Container>
				<IconWrap>{icon}</IconWrap>
				<InputSection>
					<EmptyDiv />
					<InputField
						value={amount ?? '0.00'}
						placeholder="0.00"
						onChange={(e) => setAmount(Number(e.target.value))}
					/>
					<MaxButton
						variant="primary"
						disabled={isStake ? userBalance === 0 : staked === 0}
						onClick={() => {
							setAmount(isStake ? userBalance : staked);
						}}
					>
						{t('earn.actions.max')}
					</MaxButton>
				</InputSection>
				<TotalValueWrapper>
					<Subtext>{t('earn.actions.available')}</Subtext>
					<StyledValue>
						{formatCryptoCurrency(isStake ? userBalance : staked, { currencyKey: stakedAsset })}
					</StyledValue>
				</TotalValueWrapper>
				<PaddedButton
					variant="primary"
					onClick={handleStake}
					disabled={
						synthetix && synthetix.js && amount != null && amount > 0
							? (amount ?? 0) > (isStake ? userBalance : staked)
								? true
								: false
							: true
					}
				>
					{isStake
						? t('earn.actions.stake.stake-button', { stakedAsset })
						: t('earn.actions.unstake.unstake-button', { stakedAsset })}
				</PaddedButton>
				<GasSelector
					altVersion={true}
					gasLimitEstimate={gasLimitEstimate}
					setGasPrice={setGasPrice}
				/>
			</Container>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={handleStake}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.claiming.claiming')}</ModalItemTitle>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const Container = styled(FlexDivColCentered)`
	background-color: ${(props) => props.theme.colors.black};
	height: 100%;
	width: 100%;
`;

const StyledValue = styled(Value)`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 12px;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
	width: 80%;
`;

const IconWrap = styled.div`
	width: 64px;
	height: 68px;
`;

const MaxButton = styled(StyledButton)`
	width: 25%;
	font-size: 14px;
	height: 30px;
`;

const InputSection = styled(FlexDivCentered)`
	justify-content: space-between;
	width: 80%;
`;

const EmptyDiv = styled.div`
	width: 25%;
`;

const InputField = styled(StyledInput)`
	width: 50%;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

const StakeTxContainer = styled(FlexDivColCentered)`
	width: 90%;
`;

const StakeDivider = styled(Divider)`
	margin-top: 5px;
	margin-bottom: 10px;
	width: 215px;
`;

export default StakeTab;
