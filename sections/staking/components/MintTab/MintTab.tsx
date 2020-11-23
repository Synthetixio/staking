import React, { FC, useEffect, useState } from 'react';
import { LoadingState } from 'constants/loading';
import {
	TabContainer,
	StyledButton,
	StyledCTA,
	StyledInput,
	DataContainer,
	DataRow,
	InputBox,
	RowTitle,
	RowValue,
} from '../common';
import { useTranslation } from 'react-i18next';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { getMintAmount } from '../helper';
import { formatCurrency } from 'utils/formatters/number';
import Notify from 'containers/Notify';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { SynthetixJS } from '@synthetixio/js';
import { ethers } from 'ethers';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import synthetix from 'lib/synthetix';
import GasSelector from 'components/GasSelector';
import styled from 'styled-components';

type MintTabProps = {
	amountToStake: string;
	setAmountToStake: (amount: string) => void;
	maxCollateral: number;
	targetCRatio: number;
	SNXRate: number;
};

const MintTab: FC<MintTabProps> = ({
	amountToStake,
	setAmountToStake,
	maxCollateral,
	targetCRatio,
	SNXRate,
}) => {
	const { t } = useTranslation();
	const { monitorHash } = Notify.useContainer();
	const [mintLoadingState] = useState<LoadingState | null>(null);
	const [stakingTxError, setStakingTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [stakingCurrencyKey] = useState<string>(CRYPTO_CURRENCY_MAP.SNX);
	const [synthCurrencyKey] = useState<string>(SYNTHS_MAP.sUSD);
	const [gasPrice, setGasPrice] = useState<number>(0);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						synthetix.js?.contracts.Synthetix.estimateGas.issueMaxSynths
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

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const handleStakeChange = (value: string) => setAmountToStake(value);

	const handleMaxIssuance = () => setAmountToStake(maxCollateral.toString());

	const handleStake = async () => {
		try {
			setStakingTxError(false);
			setTxModalOpen(true);
			const {
				contracts: { Synthetix },
				utils: { parseEther },
			} = synthetix.js as SynthetixJS;

			let transaction: ethers.ContractTransaction;

			if (Number(amountToStake) === maxCollateral) {
				const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.issueMaxSynths);
				transaction = await Synthetix.issueMaxSynths({
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});
			} else {
				const gasLimit = getGasEstimateForTransaction(
					[parseEther(amountToStake)],
					Synthetix.estimateGas.issueSynths
				);
				const mintAmount = getMintAmount(targetCRatio, amountToStake, SNXRate);
				transaction = await Synthetix.issueSynths(parseEther(mintAmount.toString()), {
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});
			}
			if (transaction) {
				monitorHash({ txHash: transaction.hash });
				setTxModalOpen(false);
			}
		} catch (e) {
			setStakingTxError(true);
		}
	};

	return (
		<>
			<TabContainer>
				<InputBox>
					<StyledInput
						placeholder="0"
						onChange={(e) => handleStakeChange(e.target.value)}
						value={amountToStake}
					/>
					<StyledButton onClick={handleMaxIssuance} variant="outline">
						Max
					</StyledButton>
				</InputBox>
				<DataContainer>
					<DataRow>
						<RowTitle>{t('staking.actions.mint.info.staking')}</RowTitle>
						<RowValue>
							{formatCurrency(stakingCurrencyKey, amountToStake, {
								currencyKey: stakingCurrencyKey,
							})}
						</RowValue>
					</DataRow>
					<DataRow>
						<RowTitle>{t('staking.actions.mint.info.minting')}</RowTitle>
						<RowValue>
							{formatCurrency(
								SYNTHS_MAP.sUSD,
								getMintAmount(targetCRatio, amountToStake, SNXRate),
								{
									currencyKey: SYNTHS_MAP.sUSD,
								}
							)}
						</RowValue>
					</DataRow>
				</DataContainer>
				<StyledGasContainer gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				{amountToStake !== '0' && amountToStake !== '' ? (
					<StyledCTA
						onClick={handleStake}
						variant="primary"
						size="lg"
						disabled={!!mintLoadingState}
					>
						{t('staking.actions.mint.action.mint', {
							amountToStake: formatCurrency(stakingCurrencyKey, amountToStake, {
								currencyKey: stakingCurrencyKey,
							}),
						})}
					</StyledCTA>
				) : (
					<StyledCTA variant="primary" size="lg" disabled={true}>
						{t('staking.actions.mint.action.empty')}
					</StyledCTA>
				)}
			</TabContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={stakingTxError}
					attemptRetry={handleStake}
					baseCurrencyAmount={amountToStake}
					quoteCurrencyAmount={getMintAmount(targetCRatio, amountToStake, SNXRate).toString()}
					baseCurrencyKey={stakingCurrencyKey!}
					quoteCurrencyKey={synthCurrencyKey!}
				/>
			)}
		</>
	);
};

const StyledGasContainer = styled(GasSelector)`
	margin: 16px 0px;
	flex-direction: row;
`;

export default MintTab;
