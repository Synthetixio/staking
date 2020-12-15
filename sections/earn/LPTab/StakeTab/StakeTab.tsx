import { FC, useState, ReactNode, useEffect } from 'react';
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

const getContract = (synth: CurrencyKey, provider: ethers.providers.Provider | null) => {
	const { contracts } = synthetix.js!;
	if (synth === Synths.iBTC) {
		return contracts.StakingRewardsiBTC;
	} else if (synth === Synths.iETH) {
		return contracts.StakingRewardsiETH;
	} else if (synth === Synths.sUSD && provider != null) {
		return new ethers.Contract(
			curvepoolRewards.address,
			curvepoolRewards.abi,
			provider as ethers.providers.Provider
		);
	} else {
		throw new Error('unrecognizable asset or provider not set');
	}
};

type StakeTabProps = {
	icon: ReactNode;
	isStake: boolean;
	synth: CurrencyKey;
	userBalance: number;
	staked: number;
};

const StakeTab: FC<StakeTabProps> = ({ icon, synth, isStake, userBalance, staked }) => {
	const { t } = useTranslation();
	const [amount, setAmount] = useState<number | null>(null);
	const { monitorHash } = Notify.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const { provider } = Connector.useContainer();
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
					const contract = getContract(synth, provider);
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
	}, [amount, isStake, synth]);

	const handleStake = async () => {
		if (synthetix && synthetix.js && amount != null && amount > 0) {
			try {
				setError(null);
				setTxModalOpen(true);
				const contract = getContract(synth, provider);

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
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				isStakingPanel={true}
				description={null}
				title={
					isStake ? t('earn.actions.stake.in-progress') : t('earn.actions.unstake.in-progress')
				}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<GreyHeader>
							{isStake ? t('earn.actions.stake.staking') : t('earn.actions.unstake.unstaking')}
						</GreyHeader>
						<WhiteSubheader>
							{isStake
								? t('earn.actions.stake.amount', {
										amount,
										asset: CryptoCurrency.SNX,
								  })
								: t('earn.actions.unstake.amount', {
										amount,
										asset: CryptoCurrency.SNX,
								  })}
						</WhiteSubheader>
						<Divider />
						<GreyText>{t('earn.actions.tx.notice')}</GreyText>
						<ExternalLink href={link}>
							<LinkText>{t('earn.actions.tx.link')}</LinkText>
						</ExternalLink>
					</FlexDivColCentered>
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
					<FlexDivColCentered>
						<Svg src={Success} />
						<GreyHeader>
							{isStake ? t('earn.actions.stake.staked') : t('earn.actions.unstake.withdrew')}
						</GreyHeader>
						<WhiteSubheader>
							{isStake
								? t('earn.actions.stake.amount', {
										amount,
										asset: CryptoCurrency.SNX,
								  })
								: t('earn.actions.unstake.amount', {
										amount,
										asset: CryptoCurrency.SNX,
								  })}
						</WhiteSubheader>
						<Divider />
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
					</FlexDivColCentered>
				}
			/>
		);
	}

	return (
		<>
			<Container>
				<div>{icon}</div>
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
						{formatCryptoCurrency(isStake ? userBalance : staked, { currencyKey: synth })}
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
						? t('earn.actions.stake.stake-button', { synth })
						: t('earn.actions.unstake.unstake-button', { synth })}
				</PaddedButton>
				<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
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
	font-family: ${(props) => props.theme.fonts.expanded};
	text-align: center;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

export default StakeTab;
