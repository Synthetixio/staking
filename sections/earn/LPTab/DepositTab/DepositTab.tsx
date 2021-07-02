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
import { yearnSNXVault } from 'contracts';

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
import { CryptoCurrency, CurrencyKey } from 'constants/currency';
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
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';

export const getContract = (asset: CurrencyKey, signer: ethers.Signer | null) => {
	if (asset === CryptoCurrency.SNX) {
		return new ethers.Contract(
			yearnSNXVault.address,
			// @ts-ignore
			yearnSNXVault.abi,
			signer as ethers.Signer
		);
	} else {
		throw new Error('unrecognizable asset or signer not set');
	}
};

type DepositTabProps = {
	isDeposit: boolean;
	asset: CurrencyKey;
	icon: CurrencyKey;
	type?: CurrencyIconType;
	userBalance: number;
	userBalanceBN: BigNumber;
	staked: number;
	stakedBN: BigNumber;
	pricePerShare: number;
};

const DepositTab: FC<DepositTabProps> = ({
	asset,
	icon,
	type,
	isDeposit,
	userBalance,
	userBalanceBN,
	staked,
	stakedBN,
	pricePerShare,
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

	const stakedBalanceDisplay = staked * pricePerShare;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && Number(amount) > 0) {
				try {
					setError(null);
					const contract = getContract(asset, signer);
					let stakeAmount;
					if (isDeposit) {
						stakeAmount =
							Number(amount) === userBalance
								? synthetix.js!.utils.parseEther(userBalanceBN.toString())
								: synthetix.js!.utils.parseEther(amount);
					} else {
						const withdrawMax = Number(amount) === stakedBalanceDisplay;
						stakeAmount = withdrawMax
							? synthetix.js!.utils.parseEther(stakedBN.toString())
							: synthetix.js!.utils.parseEther(amount);
					}
					let gasEstimate = await synthetix.getGasEstimateForTransaction({
						txArgs: [stakeAmount],
						method: isDeposit
							? contract.estimateGas['deposit(uint256)']
							: contract.estimateGas['withdraw(uint256)'],
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
		isDeposit,
		asset,
		signer,
		isAppReady,
		userBalance,
		userBalanceBN,
		staked,
		stakedBN,
		stakedBalanceDisplay,
	]);

	const handleDeposit = useCallback(() => {
		async function deposit() {
			if (isAppReady && Number(amount) > 0) {
				try {
					setError(null);
					setTxModalOpen(true);
					const contract = getContract(asset, signer);

					let formattedStakeAmount;
					if (isDeposit) {
						formattedStakeAmount =
							Number(amount) === userBalance
								? synthetix.js!.utils.parseEther(userBalanceBN.toString())
								: synthetix.js!.utils.parseEther(amount);
					} else {
						const withdrawMax = Number(amount) === stakedBalanceDisplay;
						formattedStakeAmount = withdrawMax
							? synthetix.js!.utils.parseEther(stakedBN.toString())
							: synthetix.js!.utils.parseEther(amount);
					}
					const gasLimit = await synthetix.getGasEstimateForTransaction({
						txArgs: [formattedStakeAmount],
						method: isDeposit
							? contract.estimateGas['deposit(uint256)']
							: contract.estimateGas['withdraw(uint256)'],
					});
					let transaction: ethers.ContractTransaction;
					if (isDeposit) {
						transaction = await contract['deposit(uint256)'](formattedStakeAmount, {
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit,
						});
					} else {
						transaction = await contract['withdraw(uint256)'](formattedStakeAmount, {
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
		deposit();
	}, [
		isAppReady,
		amount,
		asset,
		signer,
		isDeposit,
		userBalance,
		userBalanceBN,
		stakedBalanceDisplay,
		stakedBN,
		gasPrice,
		monitorTransaction,
	]);

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				isStakingPanel={true}
				isStakingPanelWaitingScreen={true}
				description={null}
				title={
					isDeposit ? t('earn.actions.deposit.in-progress') : t('earn.actions.unstake.in-progress')
				}
				content={
					<StakeTxContainer>
						<Svg src={PendingConfirmation} />
						<GreyHeader>
							{isDeposit ? t('earn.actions.stake.staking') : t('earn.actions.unstake.unstaking')}
						</GreyHeader>
						<WhiteSubheader>
							{isDeposit
								? t('earn.actions.stake.amount', {
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
										asset: asset,
								  })
								: t('earn.actions.unstake.amount', {
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
										asset: asset,
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
				title={isDeposit ? t('earn.actions.stake.success') : t('earn.actions.unstake.success')}
				content={
					<StakeTxContainer>
						<Svg src={Success} />
						<GreyHeader>
							{isDeposit ? t('earn.actions.stake.staked') : t('earn.actions.unstake.withdrew')}
						</GreyHeader>
						<WhiteSubheader>
							{isDeposit
								? t('earn.actions.stake.amount', {
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
										asset: asset,
								  })
								: t('earn.actions.unstake.amount', {
										amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
										asset: asset,
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
						onChange={(e) => {
							setAmount(e.target.value);
						}}
					/>
					<MaxButton
						variant="primary"
						disabled={isDeposit ? userBalance === 0 : staked === 0}
						onClick={() => {
							setAmount(isDeposit ? `${userBalance}` : `${stakedBalanceDisplay}`);
						}}
					>
						{t('earn.actions.max')}
					</MaxButton>
				</InputSection>
				<TotalValueWrapper>
					<Subtext>{t('earn.actions.available')}</Subtext>
					<StyledValue>
						{formatCryptoCurrency(isDeposit ? userBalance : stakedBalanceDisplay, {
							currencyKey: asset,
						})}
					</StyledValue>
				</TotalValueWrapper>
				<PaddedButton
					variant="primary"
					onClick={handleDeposit}
					disabled={
						// TODO: refactor a bit
						isAppReady && Number(amount) > 0
							? (Number(amount) ?? 0) > (isDeposit ? userBalance : stakedBalanceDisplay)
								? true
								: false
							: true
					}
				>
					{isDeposit
						? t('earn.actions.deposit.deposit-button', { asset })
						: t('earn.actions.withdraw.withdraw-button', { asset })}
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
					attemptRetry={handleDeposit}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>
									{isDeposit
										? t('earn.actions.deposit.depositing')
										: t('earn.actions.withdraw.withdrawing')}
								</ModalItemTitle>
								<ModalItemText>
									{isDeposit
										? t('earn.actions.deposit.amount', {
												amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
												asset: asset,
										  })
										: t('earn.actions.withdraw.amount', {
												amount: formatNumber(amount, { decimals: DEFAULT_CRYPTO_DECIMALS }),
												asset: asset,
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
	padding-bottom: 10px;
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

export default DepositTab;
