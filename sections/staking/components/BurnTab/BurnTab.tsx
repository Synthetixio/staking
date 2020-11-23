import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from 'constants/loading';
import {
	HeaderBox,
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
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { SynthetixJS } from '@synthetixio/js';
import Notify from 'containers/Notify';
import { ethers } from 'ethers';
import { normalizedGasPrice } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import synthetix from 'lib/synthetix';

type BurnTabProps = {
	amountToBurn: string;
	setAmountToBurn: (amount: string) => void;
	maxBurnAmount: number;
	targetCRatio: number;
	SNXRate: number;
	stakedSNX: number;
};

const BurnTab: React.FC<BurnTabProps> = ({
	amountToBurn,
	setAmountToBurn,
	maxBurnAmount,
	targetCRatio,
	SNXRate,
	stakedSNX,
}) => {
	const { t } = useTranslation();
	const [burningTxError, setBurningTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [burnLoadingState] = useState<LoadingState | null>(null);
	// const { monitorHash } = Notify.useContainer();
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const walletAddress = useRecoilValue(walletAddressState);

	const stakeTypes = [
		{
			label: CRYPTO_CURRENCY_MAP.SNX,
			key: CRYPTO_CURRENCY_MAP.SNX,
		},
		{
			label: CRYPTO_CURRENCY_MAP.ETH,
			key: CRYPTO_CURRENCY_MAP.ETH,
		},
		{
			label: CRYPTO_CURRENCY_MAP.BTC,
			key: CRYPTO_CURRENCY_MAP.BTC,
		},
	];
	const [stakeType, setStakeType] = useState(stakeTypes[0]);

	const handleStakeChange = (value: string) => setAmountToBurn(value);

	const handleMaxIssuance = () => setAmountToBurn(maxBurnAmount?.toString() || '');

	const validateCanBurn = async () => {};

	// TODO: useMemo
	// eslint-disable-next-line
	const handleBurn = async () => {
		try {
			setBurningTxError(false);
			setTxModalOpen(true);
			//TODO: Change this
			const burnToTarget = false;
			const {
				contracts: { Synthetix, Issuer },
				utils: { formatBytes32String, parseEther },
			} = synthetix.js as SynthetixJS;

			if (await Synthetix.isWaitingPeriod(formatBytes32String(SYNTHS_MAP.sUSD)))
				throw new Error('Waiting period for sUSD is still ongoing');
			if (!burnToTarget && !(await Issuer.canBurnSynths(walletAddress)))
				throw new Error('Waiting period to burn is still ongoing');

			let transaction: ethers.ContractTransaction;

			if (burnToTarget) {
				const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.burnSynthsToTarget);
				transaction = await Synthetix.burnSynthsToTarget({
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit: gasLimit,
				});
			} else {
				const gasLimit = getGasEstimateForTransaction(
					[parseEther(amountToBurn.toString())],
					Synthetix.estimateGas.burnSynths
				);
				transaction = await Synthetix.burnSynths(amountToBurn, {
					gasPrice: normalizedGasPrice(gasPrice),
					gasLimit,
				});
			}
			if (transaction) {
				// monitorHash({ txHash: transaction.hash });
				setTxModalOpen(false);
			}
		} catch (e) {
			setBurningTxError(true);
		}
	};

	return (
		<TabContainer>
			<HeaderBox>
				<p>{t('staking.actions.burn.info.header')}</p>
			</HeaderBox>
			<InputBox>
				<StyledInput
					placeholder="0"
					onChange={(e) => handleStakeChange(e.target.value)}
					value={amountToBurn}
				/>
				<StyledButton onClick={handleMaxIssuance} variant="outline">
					Max
				</StyledButton>
			</InputBox>
			<DataContainer>
				<DataRow>
					<RowTitle>{t('staking.actions.burn.info.burning')}</RowTitle>
					<RowValue>{amountToBurn} sUSD</RowValue>
				</DataRow>
				<DataRow>
					<RowTitle>{t('staking.actions.burn.info.unstaking')}</RowTitle>
					<RowValue>
						{maxBurnAmount === Number(amountToBurn) ? stakedSNX : 0} {stakeType.label}
					</RowValue>
				</DataRow>
			</DataContainer>
			{amountToBurn !== '0' && amountToBurn !== '' ? (
				// TODO: fix this tsc err
				// @ts-ignore
				<StyledCTA onClick={handleBurn} variant="primary" size="lg" disabled={!!burnLoadingState}>
					{t('staking.actions.burn.action.burn', {
						amountToBurn: amountToBurn,
						stakeType: stakeType.label,
					})}
				</StyledCTA>
			) : (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{t('staking.actions.mint.action.empty')}
				</StyledCTA>
			)}
		</TabContainer>
	);
};

export default BurnTab;
