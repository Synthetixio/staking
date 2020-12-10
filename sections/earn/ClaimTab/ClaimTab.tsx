import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { ethers } from 'ethers';

import {
	ErrorMessage,
	FlexDivCentered,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import BigNumber from 'bignumber.js';
import { formatCurrency, formatFiatCurrency } from 'utils/formatters/number';
import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { Transaction } from 'constants/network';
import Etherscan from 'containers/Etherscan';
import GasSelector from 'components/GasSelector';
import Notify from 'containers/Notify';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';
import largeWaveSVG from 'assets/svg/app/large-wave.svg';
import {
	TotalValueWrapper,
	Subtext,
	Value,
	StyledButton,
	Label,
	StyledLink,
	TabContainer,
} from '../common';

type ClaimTabProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	refetch: Function;
};

const ClaimTab: React.FC<ClaimTabProps> = ({
	tradingRewards,
	stakingRewards,
	totalRewards,
	refetch,
}) => {
	const { t } = useTranslation();
	const claimed = useClaimedStatus();
	const { monitorHash } = Notify.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const { notify } = Connector.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					setError(null);
					const {
						contracts: { FeePool },
					} = synthetix.js as SynthetixJS;
					let gasEstimate = await getGasEstimateForTransaction([], FeePool.estimateGas.claimFees);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					if (!error.message.includes('already claimed')) {
						setError(error.message);
					}
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [synthetix]);

	const handleClaim = async () => {
		try {
			setError(null);
			setTxModalOpen(true);
			const {
				contracts: { FeePool },
			} = synthetix.js!;

			let transaction: ethers.ContractTransaction;
			const gasLimit = getGasEstimateForTransaction([], FeePool.estimateGas.claimFees);
			transaction = await FeePool.claimFees({
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
	};

	return (
		<>
			<TabContainer>
				<Label>
					<Trans i18nKey="earn.incentives.options.snx.description" components={[<StyledLink />]} />
				</Label>

				<InnerContainer>
					<ValueBoxWrapper>
						<ValueBox>
							<Svg src={snxSVG} />
							<Value>
								{formatCurrency(SYNTHS_MAP.sUSD, tradingRewards, {
									currencyKey: SYNTHS_MAP.sUSD,
									decimals: 2,
								})}
							</Value>
							<Subtext>{t('earn.incentives.options.snx.trading-rewards')}</Subtext>
						</ValueBox>
						<ValueBox>
							<Svg src={snxSVG} />
							<Value>
								{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, stakingRewards, {
									currencyKey: CRYPTO_CURRENCY_MAP.SNX,
								})}
							</Value>
							<Subtext>{t('earn.incentives.options.snx.staking-rewards')}</Subtext>
						</ValueBox>
					</ValueBoxWrapper>
					<TotalValueWrapper>
						<Subtext>{t('earn.incentives.options.snx.total-value')}</Subtext>
						<Value>
							{formatFiatCurrency(totalRewards, {
								sign: '$',
							})}
						</Value>
					</TotalValueWrapper>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					<PaddedButton variant="primary" onClick={handleClaim} disabled={error != null || claimed}>
						{claimed
							? t('earn.actions.claim.claimed-button')
							: t('earn.actions.claim.claim-button')}
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
	padding: 15px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${largeWaveSVG.src});
	background-size: cover;
`;

const ValueBoxWrapper = styled(FlexDivCentered)`
	justify-content: space-around;
`;

const ValueBox = styled(FlexDivColCentered)`
	width: 150px;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
`;

export default ClaimTab;
