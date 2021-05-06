import { FC, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { Svg } from 'react-optimized-image';
import BigNumber from 'bignumber.js';

import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import GasSelector from 'components/GasSelector';
import synthetix from 'lib/synthetix';
import NumericInput from 'components/Input/NumericInput';
import { formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { normalizedGasPrice } from 'utils/network';
import Etherscan from 'containers/BlockExplorer';
import Connector from 'containers/Connector';
import { curveSusdRewards, dualStakingRewards } from 'contracts';

import {
	ExternalLink,
	FlexDivCentered,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemText,
	ModalItemTitle,
} from 'styles/common';
import Currency from 'components/Currency';
import { CurrencyKey, Synths } from 'constants/currency';
import { Transaction, GasLimitEstimate } from 'constants/network';
import TransactionNotifier from 'containers/TransactionNotifier';
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
	IconWrap,
} from '../../common';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import curveSeuroRewards from 'contracts/curveSeuroRewards';
import { LP } from 'sections/earn/types';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';

export const getContract = (stakedAsset: CurrencyKey, signer: ethers.Signer | null) => {
	const { contracts } = synthetix.js!;
	if (stakedAsset === Synths.iBTC) {
		return contracts.StakingRewardsiBTC;
	} else if (stakedAsset === Synths.iETH) {
		return contracts.StakingRewardsiETH;
	} else if (stakedAsset === LP.BALANCER_sTSLA) {
		return contracts.StakingRewardssTSLABalancer;
	} else if (stakedAsset === LP.BALANCER_sFB) {
		return contracts.StakingRewardssFBBalancer;
	} else if (stakedAsset === LP.BALANCER_sAAPL) {
		return contracts.StakingRewardssAAPLBalancer;
	} else if (stakedAsset === LP.BALANCER_sAMZN) {
		return contracts.StakingRewardssAMZNBalancer;
	} else if (stakedAsset === LP.BALANCER_sNFLX) {
		return contracts.StakingRewardssNFLXBalancer;
	} else if (stakedAsset === LP.BALANCER_sGOOG) {
		return contracts.StakingRewardssGOOGBalancer;
	} else if (stakedAsset === LP.BALANCER_sMSFT) {
		return contracts.StakingRewardssMSFTBalancer;
	} else if (stakedAsset === LP.BALANCER_sCOIN) {
		return contracts.StakingRewardssCOINBalancer;
	} else if (stakedAsset === LP.CURVE_sUSD && signer != null) {
		return new ethers.Contract(
			curveSusdRewards.address,
			curveSusdRewards.abi,
			signer as ethers.Signer
		);
	} else if (stakedAsset === LP.CURVE_sEURO && signer != null) {
		return new ethers.Contract(
			curveSeuroRewards.address,
			curveSeuroRewards.abi,
			signer as ethers.Signer
		);
	} else if (stakedAsset === LP.UNISWAP_DHT && signer != null) {
		return new ethers.Contract(
			dualStakingRewards.address,
			dualStakingRewards.abi,
			signer as ethers.Signer
		);
	} else {
		throw new Error('unrecognizable asset or signer not set');
	}
};

type StakeTabProps = {
	isStake: boolean;
	stakedAsset: CurrencyKey;
	icon: CurrencyKey;
	type?: CurrencyIconType;
	userBalance: number;
	userBalanceBN: BigNumber;
	staked: number;
	stakedBN: BigNumber;
};

const StakeTab: FC<StakeTabProps> = ({
	stakedAsset,
	icon,
	type,
	isStake,
	userBalance,
	userBalanceBN,
	staked,
	stakedBN,
}) => {
	const { t } = useTranslation();
	const [amount, setAmount] = useState<string>('');
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const { signer } = Connector.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const isAppReady = useRecoilValue(appReadyState);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const link =
		blockExplorerInstance != null && txHash != null
			? blockExplorerInstance.txLink(txHash)
			: undefined;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && Number(amount) > 0) {
				try {
					setError(null);
					const contract = getContract(stakedAsset, signer);
					let stakeAmount;
					if (isStake) {
						stakeAmount =
							Number(amount) === userBalance
								? userBalanceBN
								: synthetix.js!.utils.parseEther(amount);
					} else {
						stakeAmount =
							Number(amount) === staked ? stakedBN : synthetix.js!.utils.parseEther(amount);
					}
					let gasEstimate = await synthetix.getGasEstimateForTransaction({
						txArgs: [stakeAmount],
						method: isStake ? contract.estimateGas.stake : contract.estimateGas.withdraw,
					});
					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [
		amount,
		isStake,
		stakedAsset,
		signer,
		isAppReady,
		userBalance,
		userBalanceBN,
		staked,
		stakedBN,
	]);

	const handleStake = useCallback(() => {
		async function stake() {
			if (isAppReady && Number(amount) > 0) {
				try {
					setError(null);
					setTxModalOpen(true);
					const contract = getContract(stakedAsset, signer);

					let formattedStakeAmount;

					if (isStake) {
						formattedStakeAmount =
							Number(amount) === userBalance
								? userBalanceBN
								: synthetix.js!.utils.parseEther(amount);
					} else {
						formattedStakeAmount =
							Number(amount) === staked ? stakedBN : synthetix.js!.utils.parseEther(amount);
					}
					const gasLimit = await synthetix.getGasEstimateForTransaction({
						txArgs: [formattedStakeAmount],
						method: isStake ? contract.estimateGas.stake : contract.estimateGas.withdraw,
					});
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
						monitorTransaction({
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
	}, [
		gasPrice,
		isStake,
		monitorTransaction,
		amount,
		signer,
		stakedAsset,
		isAppReady,
		userBalanceBN,
		userBalance,
		staked,
		stakedBN,
	]);

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
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
										asset: stakedAsset,
								  })
								: t('earn.actions.unstake.amount', {
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
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
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
										asset: stakedAsset,
								  })
								: t('earn.actions.unstake.amount', {
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
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
				<IconWrap>
					<Currency.Icon
						currencyKey={icon}
						width={'38'}
						height={'38'}
						type={type ? type : undefined}
					/>
				</IconWrap>
				<InputSection>
					<EmptyDiv />
					<StyledNumericInput
						value={amount}
						placeholder="0.00"
						onChange={(e) => setAmount(e.target.value)}
					/>
					<MaxButton
						variant="primary"
						disabled={isStake ? userBalance === 0 : staked === 0}
						onClick={() => {
							setAmount(isStake ? `${userBalance}` : `${staked}`);
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
						// TODO: refactor a bit
						isAppReady && Number(amount) > 0
							? (Number(amount) ?? 0) > (isStake ? userBalance : staked)
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
								<ModalItemTitle>
									{isStake ? t('earn.actions.stake.staking') : t('earn.actions.unstake.unstaking')}
								</ModalItemTitle>
								<ModalItemText>
									{isStake
										? t('earn.actions.stake.amount', {
												amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
												asset: stakedAsset,
										  })
										: t('earn.actions.unstake.amount', {
												amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
												asset: stakedAsset,
										  })}
								</ModalItemText>
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
	text-transform: none;
`;

const MaxButton = styled(StyledButton)`
	width: 20%;
	font-size: 12px;
	height: 24px;
	background-color: ${(props) => props.theme.colors.black};
	color: ${(props) => props.theme.colors.blue};
	border: 1px solid ${(props) => props.theme.colors.blue};
	line-height: 18px;
`;

const InputSection = styled(FlexDivCentered)`
	justify-content: space-between;
	width: 80%;
`;

const EmptyDiv = styled.div`
	width: 20%;
`;

const StyledNumericInput = styled(NumericInput)`
	width: 60%;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

const StakeTxContainer = styled(FlexDivColCentered)``;

const StakeDivider = styled(Divider)`
	margin-top: 5px;
	margin-bottom: 10px;
	width: 215px;
`;

export default StakeTab;
