import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { SynthetixJS } from '@synthetixio/js';
import synthetix from 'lib/synthetix';

import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import { StyledCTA, TabContainer } from '../common';
import GasSelector from 'components/GasSelector';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { Transaction } from 'constants/network';
import { formatCurrency } from 'utils/formatters/number';
import { useTranslation } from 'react-i18next';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { ethers } from 'ethers';
import Notify from 'containers/Notify';
import { CryptoCurrency } from 'constants/currency';
import { FlexDivColCentered, ModalItem, ModalItemText, ModalItemTitle } from 'styles/common';
import { ActionCompleted, ActionInProgress } from '../TxSent';
import useTokenSaleEscrowQuery from 'queries/escrow/useTokenSaleEscrowQuery';

const TokenSaleTab: React.FC = () => {
	const { t } = useTranslation();
	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery();

	const { monitorHash } = Notify.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [vestTxError, setVestTxError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const tokenSaleData = tokenSaleEscrowQuery?.data;

	const availableTokensForVesting = tokenSaleData?.availableTokensForVesting ?? 0;

	const vestingCurrencyKey = CryptoCurrency['SNX'];

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						synthetix.js?.contracts.SynthetixEscrow.estimateGas.vest
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [synthetix, error]);

	const handleVest = async () => {
		try {
			setVestTxError(null);
			setTxModalOpen(true);
			const {
				contracts: { SynthetixEscrow },
			} = synthetix.js as SynthetixJS;

			let transaction: ethers.ContractTransaction = await SynthetixEscrow.vest({
				gasPrice: normalizedGasPrice(gasPrice),
				gasLimitEstimate,
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
			// TODO: translate this
			setVestTxError('vest tx error');
		}
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress
				vestingAmount={availableTokensForVesting.toString()}
				currencyKey={vestingCurrencyKey}
				hash={txHash as string}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<ActionCompleted
				currencyKey={vestingCurrencyKey}
				hash={txHash as string}
				vestingAmount={availableTokensForVesting.toString()}
				setTransactionState={setTransactionState}
			/>
		);
	}

	return (
		<>
			<TabContainer>
				<InfoContainer>
					<Svg src={SNXLogo} />
					<Data>
						{availableTokensForVesting} {vestingCurrencyKey}
					</Data>
				</InfoContainer>
				<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				{availableTokensForVesting ? (
					<StyledCTA
						blue={true}
						onClick={handleVest}
						variant="primary"
						size="lg"
						disabled={error !== null || transactionState !== Transaction.PRESUBMIT}
					>
						{t('escrow.actions.vest-button', {
							canVestAmount: formatCurrency(vestingCurrencyKey, availableTokensForVesting, {
								currencyKey: vestingCurrencyKey,
							}),
						})}
					</StyledCTA>
				) : (
					<StyledCTA blue={true} variant="primary" size="lg" disabled={true}>
						{t('escrow.actions.disabled')}
					</StyledCTA>
				)}
			</TabContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={vestTxError}
					attemptRetry={handleVest}
					content={
						<ModalItem>
							<ModalItemTitle>{t('modals.confirm-transaction.vesting.title')}</ModalItemTitle>
							<ModalItemText>
								{formatCurrency(vestingCurrencyKey, availableTokensForVesting, {
									currencyKey: vestingCurrencyKey,
									decimals: 4,
								})}
							</ModalItemText>
						</ModalItem>
					}
				/>
			)}
		</>
	);
};

const InfoContainer = styled(FlexDivColCentered)`
	height: 75%;
`;
const Data = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 24px;
`;

export default TokenSaleTab;
