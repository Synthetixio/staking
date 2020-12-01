import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from 'constants/loading';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';
import sUSDIcon from '@synthetixio/assets/synths/sUSD.svg';

import {
	TabContainer,
	StyledCTA,
	StyledInput,
	DataContainer,
	DataRow,
	InputBox,
	RowTitle,
	RowValue,
	InputContainer,
	InputLocked,
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
import { getMintAmount, getStakingAmount } from '../helper';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { formatCurrency } from 'utils/formatters/number';
import Staking, { BurnActionType } from 'sections/staking/context/StakingContext';
import BurnTiles from '../BurnTiles';
import NavigationBack from 'assets/svg/app/navigation-back.svg';

type BurnTabProps = {
	maxBurnAmount: number;
	targetCRatio: number;
	maxCollateral: number;
	SNXRate: number;
	stakedSNX: number;
};

const BurnTab: React.FC<BurnTabProps> = ({
	maxBurnAmount,
	maxCollateral,
	targetCRatio,
	SNXRate,
	stakedSNX,
}) => {
	const { t } = useTranslation();
	const { monitorHash } = Notify.useContainer();
	const { amountToBurn, onBurnChange, burnType, onBurnTypeChange } = Staking.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);

	const [burningTxError, setBurningTxError] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [burnLoadingState] = useState<LoadingState | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
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

	const handleBurnChange = (value: string) => {
		setBurnToTarget(false);
		onBurnChange(value);
	};

	const handleMaxBurn = () => {
		setBurnToTarget(false);
		onBurnChange(maxBurnAmount?.toString() || '');
	};

	const handleBurnToTarget = () => {
		setBurnToTarget(true);
		const maxIssuableSynths = getMintAmount(targetCRatio, maxCollateral.toString(), SNXRate);
		onBurnChange(Math.max(maxBurnAmount - maxIssuableSynths, 0).toString());
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

	/**
	 * Given the amount to mint, returns the equivalent collateral needed for stake.
	 * @param mintInput Amount to mint
	 */
	const stakeInfo = (mintInput: string) =>
		formatCurrency(stakingCurrencyKey, getStakingAmount(targetCRatio, mintInput, SNXRate), {
			currencyKey: stakingCurrencyKey,
		});

	/**
	 * Given the amount to stake, returns the equivalent debt produced. (Estimate)
	 * @param mintInput Amount to mint
	 */
	const mintInfo = (stakeInput: string) =>
		formatCurrency(synthCurrencyKey, getMintAmount(targetCRatio, stakeInput, SNXRate), {
			currencyKey: synthCurrencyKey,
		});

	const formattedDebt = formatCurrency(synthCurrencyKey, amountToBurn, {
		currencyKey: synthCurrencyKey,
	});

	const formattedStake = formatCurrency(stakingCurrencyKey, maxCollateral.toString(), {
		currencyKey: stakingCurrencyKey,
	});

	const returnInput = (inputTypes: { max?: boolean; custom?: boolean; target?: boolean }) => {
		const { max, custom, target } = inputTypes;
		return (
			<>
				<InputContainer>
					<IconContainer onClick={() => onBurnTypeChange(null)}>
						<Svg src={NavigationBack} />
					</IconContainer>
					<InputBox>
						<Img width={50} height={50} src={sUSDIcon} />
						{max || target ? (
							<InputLocked>{mintInfo(maxBurnAmount.toString())}</InputLocked>
						) : (
							<StyledInput placeholder="0" onChange={(e) => onBurnChange(e.target.value)} />
						)}
					</InputBox>
					<DataContainer>
						<DataRow>
							<RowTitle>{t('staking.actions.burn.info.unstaking')}</RowTitle>
							<RowValue>{max ? stakeInfo(amountToBurn) : 0}</RowValue>
						</DataRow>
						<DataRow>
							<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
						</DataRow>
					</DataContainer>
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
				</InputContainer>
				{txModalOpen && (
					<TxConfirmationModal
						onDismiss={() => setTxModalOpen(false)}
						txError={burningTxError}
						attemptRetry={handleBurn}
						content={
							<ModalContent>
								<ModalItem>
									<ModalItemTitle>{t('modals.confirm-transaction.staking.from')}</ModalItemTitle>
									<ModalItemText>{formattedDebt}</ModalItemText>
								</ModalItem>
								<ModalItem>
									<ModalItemTitle>{t('modals.confirm-transaction.staking.to')}</ModalItemTitle>
									<ModalItemText>{stakeInfo(amountToBurn)}</ModalItemText>
								</ModalItem>
							</ModalContent>
						}
					/>
				)}
			</>
		);
	};

	const returnPanel = useMemo(() => {
		switch (burnType) {
			case BurnActionType.MAX:
				return returnInput({ max: true });
			case BurnActionType.CUSTOM:
				return returnInput({ custom: true });
			case BurnActionType.TARGET:
				return returnInput({ target: true });
			default:
				return <BurnTiles targetCRatio={targetCRatio} />;
		}
	}, [burnType, amountToBurn, targetCRatio]);

	return <TabContainer>{returnPanel}</TabContainer>;
};

const IconContainer = styled.div`
	position: absolute;
	top: 20px;
	left: 20px;
	cursor: pointer;
`;

export default BurnTab;
