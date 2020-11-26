import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from 'constants/loading';
import styled from 'styled-components';
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
import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { SynthetixJS } from '@synthetixio/js';
import Notify from 'containers/Notify';
import { ethers } from 'ethers';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import synthetix from 'lib/synthetix';
import GasSelector from 'components/GasSelector';
import { FlexDivRowCentered } from 'styles/common';
import { getMintAmount, getStakingAmount } from '../helper';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { formatCurrency } from 'utils/formatters/number';

type BurnTabProps = {
	amountToBurn: string;
	setAmountToBurn: (amount: string) => void;
	maxBurnAmount: number;
	targetCRatio: number;
	maxCollateral: number;
	SNXRate: number;
	stakedSNX: number;
};

const BurnTab: React.FC<BurnTabProps> = ({
	amountToBurn,
	setAmountToBurn,
	maxBurnAmount,
	maxCollateral,
	targetCRatio,
	SNXRate,
	stakedSNX,
}) => {
	const { t } = useTranslation();
	const [burningTxError, setBurningTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [burnLoadingState] = useState<LoadingState | null>(null);
	const { monitorHash } = Notify.useContainer();
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const walletAddress = useRecoilValue(walletAddressState);
	const [burnToTarget, setBurnToTarget] = useState<boolean>(false);
	const [stakingCurrencyKey] = useState<string>(CRYPTO_CURRENCY_MAP.SNX);
	const [synthCurrencyKey] = useState<string>(SYNTHS_MAP.sUSD);
	const [gasPrice, setGasPrice] = useState<number>(0);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				const {
					contracts: { Synthetix },
					utils: { parseEther },
				} = synthetix.js as SynthetixJS;
				try {
					const gasEstimate = await getGasEstimateForTransaction(
						[parseEther(amountToBurn.toString())],
						Synthetix.estimateGas.burnSynths
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

	const handleStakeChange = (value: string) => {
		if (burnToTarget) {
			setBurnToTarget(false);
		}
		setAmountToBurn(value);
	};

	const handleMaxBurn = () => {
		setBurnToTarget(false);
		setAmountToBurn(maxBurnAmount?.toString() || '');
	};

	const handleBurnToTarget = () => {
		setBurnToTarget(true);
		const maxIssuableSynths = getMintAmount(targetCRatio, maxCollateral.toString(), SNXRate);
		setAmountToBurn(Math.max(maxBurnAmount - maxIssuableSynths, 0).toString());
	};

	const handleBurn = async () => {
		try {
			setBurningTxError(false);
			setTxModalOpen(true);
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
				monitorHash({ txHash: transaction.hash });
				setTxModalOpen(false);
			}
		} catch (e) {
			setBurningTxError(true);
		}
	};

	return (
		<>
			<TabContainer>
				<InputBox>
					<StyledInput
						placeholder="0"
						onChange={(e) => handleStakeChange(e.target.value)}
						value={amountToBurn}
					/>
				</InputBox>
				<FlexDivRowCentered>
					<StyledButton
						blue={false}
						style={{ width: '50%', marginRight: 5 }}
						onClick={handleMaxBurn}
						variant="outline"
					>
						{t('staking.actions.burn.action.max')}
					</StyledButton>
					<StyledButton
						blue={false}
						style={{ width: '50%', marginLeft: 5 }}
						onClick={handleBurnToTarget}
						variant="outline"
					>
						{t('staking.actions.burn.action.to-target')}
					</StyledButton>
				</FlexDivRowCentered>
				<DataContainer>
					<DataRow>
						<RowTitle>{t('staking.actions.burn.info.burning')}</RowTitle>
						<RowValue>
							{amountToBurn} {synthCurrencyKey}
						</RowValue>
					</DataRow>
					<DataRow>
						<RowTitle>{t('staking.actions.burn.info.unstaking')}</RowTitle>
						<RowValue>
							{maxBurnAmount === Number(amountToBurn)
								? stakedSNX
								: getStakingAmount(targetCRatio, amountToBurn.toString(), SNXRate)}
							{stakingCurrencyKey}
						</RowValue>
					</DataRow>
				</DataContainer>
				<StyledGasContainer gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				{amountToBurn !== '0' && amountToBurn !== '' ? (
					<StyledCTA
						blue={false}
						onClick={handleBurn}
						variant="alt"
						size="lg"
						disabled={!!burnLoadingState}
					>
						{t('staking.actions.burn.action.burn', {
							amountToBurn: amountToBurn,
							stakeType: stakingCurrencyKey,
						})}
					</StyledCTA>
				) : (
					<StyledCTA blue={false} variant="alt" size="lg" disabled={true}>
						{t('staking.actions.mint.action.empty')}
					</StyledCTA>
				)}
			</TabContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={burningTxError}
					attemptRetry={handleBurn}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.from')}</ModalItemTitle>
								<ModalItemText>
									{formatCurrency(stakingCurrencyKey, amountToBurn, {
										currencyKey: stakingCurrencyKey,
										decimals: 4,
									})}
								</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.to')}</ModalItemTitle>
								<ModalItemText>
									{formatCurrency(
										synthCurrencyKey,
										getMintAmount(
											targetCRatio,
											getStakingAmount(targetCRatio, amountToBurn.toString(), SNXRate).toString(),
											SNXRate
										).toString(),
										{
											currencyKey: synthCurrencyKey,
											decimals: 4,
										}
									)}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const StyledGasContainer = styled(GasSelector)`
	margin: 16px 0px;
	flex-direction: row;
`;

export default BurnTab;
