import React, { useEffect, useState, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { Svg } from 'react-optimized-image';

import { ExternalLink, FlexDiv } from 'styles/common';
import synthetix from 'lib/synthetix';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';

import Etherscan from 'containers/Etherscan';
import Notify from 'containers/Notify';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { formatCurrency, formatFiatCurrency } from 'utils/formatters/number';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';

import { Transaction } from 'constants/network';
import { CryptoCurrency, Synths } from 'constants/currency';
import TxState from 'sections/earn/TxState';

import {
	GreyHeader,
	WhiteSubheader,
	Divider,
	VerifyButton,
	DismissButton,
	ButtonSpacer,
	GreyText,
	LinkText,
} from '../common';

import GasSelector from 'components/GasSelector';

import largeWaveSVG from 'assets/svg/app/large-wave.svg';

import {
	ErrorMessage,
	FlexDivCentered,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
} from 'styles/common';

import {
	TotalValueWrapper,
	Subtext,
	Value,
	StyledButton,
	Label,
	StyledLink,
	TabContainer,
} from '../common';
import Currency from 'components/Currency';

type ClaimTabProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
};

const ClaimTab: React.FC<ClaimTabProps> = ({ tradingRewards, stakingRewards, totalRewards }) => {
	const { t } = useTranslation();
	const claimed = useClaimedStatus();
	const { monitorHash } = Notify.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const [lowCRatio, setLowCRatio] = useState(false);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const link =
		etherscanInstance != null && txHash != null ? etherscanInstance.txLink(txHash) : undefined;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					setError(null);
					const {
						contracts: { FeePool },
					} = synthetix.js!;
					let gasEstimate = await getGasEstimateForTransaction([], FeePool.estimateGas.claimFees);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					if (error.message.includes('below penalty threshold')) {
						setLowCRatio(true);
					} else if (!error.message.includes('already claimed')) {
						setError(error.message);
					}
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, []);

	const handleClaim = useCallback(() => {
		async function claim() {
			try {
				setError(null);
				setTxModalOpen(true);
				const {
					contracts: { FeePool },
				} = synthetix.js!;

				const gasLimit = await getGasEstimateForTransaction([], FeePool.estimateGas.claimFees);
				const transaction: ethers.ContractTransaction = await FeePool.claimFees({
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});

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
		claim();
	}, [gasPrice, monitorHash]);

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				description={
					<Label>
						<Trans
							i18nKey="earn.incentives.options.snx.description"
							components={[<StyledLink />]}
						/>
					</Label>
				}
				title={t('earn.actions.claim.in-progress')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<StyledFlexDiv>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: tradingRewards,
										asset: Synths.sUSD,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: stakingRewards,
										asset: CryptoCurrency.SNX,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
						</StyledFlexDiv>
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
				description={
					<Label>
						<Trans
							i18nKey="earn.incentives.options.snx.description"
							components={[<StyledLink />]}
						/>
					</Label>
				}
				title={t('earn.actions.claim.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<StyledFlexDiv>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claimed')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: tradingRewards,
										asset: Synths.sUSD,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claimed')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: stakingRewards,
										asset: CryptoCurrency.SNX,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
						</StyledFlexDiv>
						<Divider />
						<ButtonSpacer>
							{link ? (
								<ExternalLink href={link}>
									<VerifyButton>{t('earn.actions.tx.verify')}</VerifyButton>
								</ExternalLink>
							) : null}
							<DismissButton
								variant="secondary"
								onClick={() => {
									setTransactionState(Transaction.PRESUBMIT);
								}}
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
			<TabContainer>
				<Label>
					<Trans i18nKey="earn.incentives.options.snx.description" components={[<StyledLink />]} />
				</Label>

				<InnerContainer>
					<ValueBoxWrapper>
						<ValueBox>
							<Currency.Icon currencyKey={Synths.sUSD} width="48" height="48" />
							<Value>
								{formatCurrency(Synths.sUSD, tradingRewards, {
									currencyKey: Synths.sUSD,
									decimals: 2,
								})}
							</Value>
							<Subtext>{t('earn.incentives.options.snx.trading-rewards')}</Subtext>
						</ValueBox>
						<ValueBox>
							<Currency.Icon currencyKey={CryptoCurrency.SNX} width="48" height="48" />
							<Value>
								{formatCurrency(CryptoCurrency.SNX, stakingRewards, {
									currencyKey: CryptoCurrency.SNX,
								})}
							</Value>
							<Subtext>{t('earn.incentives.options.snx.staking-rewards')}</Subtext>
						</ValueBox>
					</ValueBoxWrapper>
					<TotalValueWrapper>
						<Subtext>{t('earn.incentives.options.snx.total-value')}</Subtext>
						<Value>
							{formatFiatCurrency(getPriceAtCurrentRate(totalRewards), {
								sign: selectedPriceCurrency.sign,
							})}
						</Value>
					</TotalValueWrapper>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					<PaddedButton
						variant="primary"
						onClick={handleClaim}
						disabled={totalRewards.toNumber() === 0 || claimed}
					>
						{claimed
							? t('earn.actions.claim.claimed-button')
							: lowCRatio && totalRewards.toNumber() > 0
							? t('earn.actions.claim.low-ratio')
							: totalRewards.toNumber() > 0
							? t('earn.actions.claim.claim-button')
							: t('earn.actions.claim.nothing-to-claim')}
					</PaddedButton>
					<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				</InnerContainer>
			</TabContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={handleClaim}
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

const InnerContainer = styled(FlexDivColCentered)`
	width: 90%;
	margin: 15px auto;
	padding: 20px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${largeWaveSVG.src});
	background-size: cover;
`;

const ValueBoxWrapper = styled(FlexDivCentered)`
	justify-content: space-around;
	width: 350px;
`;

const ValueBox = styled(FlexDivColCentered)`
	width: 160px;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
`;

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
	padding: 20px 30px;
	&:first-child {
		border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	}
`;

const StyledFlexDiv = styled(FlexDiv)`
	margin-bottom: -20px;
`;

export default ClaimTab;
