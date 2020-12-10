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
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { FlexDivColCentered, ModalItem, ModalItemText, ModalItemTitle } from 'styles/common';
import { ActionCompleted, ActionInProgress } from '../TxSent';
import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';

const StakingRewardsTab: React.FC = () => {
	const { t } = useTranslation();
	const escrowDataQuery = useEscrowDataQuery();

	const { monitorHash } = Notify.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [vestTxError, setVestTxError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const escrowData = escrowDataQuery?.data;

	const canVestAmount = escrowData?.canVest ?? 0;

	const vestingCurrencyKey = CRYPTO_CURRENCY_MAP['SNX'];

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						synthetix.js?.contracts.RewardEscrow.estimateGas.vest
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
				contracts: { RewardEscrow },
				utils: { parseEther },
			} = synthetix.js as SynthetixJS;

			let transaction: ethers.ContractTransaction = await RewardEscrow.vest({
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
				vestingAmount={canVestAmount.toString()}
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
				vestingAmount={canVestAmount.toString()}
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
						{canVestAmount} {vestingCurrencyKey}
					</Data>
				</InfoContainer>

				<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				{canVestAmount > 0 ? (
					<StyledCTA
						blue={true}
						onClick={handleVest}
						variant="primary"
						size="lg"
						disabled={transactionState !== Transaction.PRESUBMIT}
					>
						{t('escrow.actions.vest-button', {
							canVestAmount: formatCurrency(vestingCurrencyKey, canVestAmount, {
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
								{formatCurrency(vestingCurrencyKey, canVestAmount, {
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

export default StakingRewardsTab;
