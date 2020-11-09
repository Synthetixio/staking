import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import MintTab from './components/MintTab';
import BurnTab from './components/BurnTab';

import StructuredTab from 'components/StructuredTab';
import { LoadingState } from 'constants/loading';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import { StakingPanelType } from 'pages/staking';
import { getGasEstimateForTransaction } from 'utils/transactions';
import synthetix from 'lib/synthetix';
import { SynthetixJS } from '@synthetixio/js';
import useEthGasStationQuery from 'queries/network/useGasStationQuery';
import { GWEI_UNIT } from 'constants/network';
import { getMintAmount } from './components/helper';

interface MintBurnBoxProps {
	targetCRatio: number;
	maxCollateral: number;
	maxBurnAmount: number;
	snxPrice: number;
	amountToBurn: string;
	amountToStake: string;
	setAmountToStake: (amount: string) => void;
	setAmountToBurn: (amount: string) => void;
	setPanelType: (type: StakingPanelType) => void;
	stakedSNX: number;
}

const MintBurnBox: FC<MintBurnBoxProps> = ({
	targetCRatio,
	maxCollateral,
	maxBurnAmount,
	snxPrice,
	amountToBurn,
	amountToStake,
	setAmountToBurn,
	setAmountToStake,
	setPanelType,
	stakedSNX,
}) => {
	const { t } = useTranslation();
	const [mintLoadingState, setMintLoadingState] = useState<LoadingState | null>(null);
	const [burnLoadingState, setBurnLoadingState] = useState<LoadingState | null>(null);
	const ethGasStationQuery = useEthGasStationQuery();
	const gasPrice = ethGasStationQuery?.data?.average ?? 0;

	const handleStake = async () => {
		try {
			const {
				contracts: { Synthetix },
				utils,
			} = synthetix.js as SynthetixJS;

			// Open Modal
			let transaction;
			if (Number(amountToStake) === maxCollateral) {
				const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.issueMaxSynths);
				transaction = await Synthetix.issueMaxSynths({
					gasPrice: gasPrice * GWEI_UNIT,
					gasLimit,
				});
			} else {
				const gasLimit = getGasEstimateForTransaction(
					[utils.parseEther(amountToStake)],
					Synthetix.estimateGas.issueSynths
				);
				const mintAmount = getMintAmount(targetCRatio, amountToStake, snxPrice);
				transaction = await Synthetix.issueSynths(utils.parseEther(mintAmount.toString()), {
					gasPrice: gasPrice * GWEI_UNIT,
					gasLimit,
				});
			}
			// if (notify && transaction) {
			// 	const refetch = () => {
			// 		fetchDebtStatusRequest();
			// 		fetchBalancesRequest();
			// 	};
			// 	const message = `Minted ${formatCurrency(mintAmount)} sUSD`;
			// 	setTransactionInfo({ transactionHash: transaction.hash });
			// 	notifyHandler(notify, transaction.hash, networkId, refetch, message);
			// }
		} catch (e) {
			console.log(e);
		}
	};

	const tabData = useMemo(
		() => [
			{
				title: t('staking.actions.mint.title'),
				icon: () => <Svg src={Mint} />,
				tabChildren: (
					<MintTab
						amountToStake={amountToStake}
						setAmountToStake={setAmountToStake}
						targetCRatio={targetCRatio}
						maxCollateral={maxCollateral}
						mintLoadingState={mintLoadingState}
						snxPrice={snxPrice}
						handleStake={handleStake}
					/>
				),
			},
			{
				title: t('staking.actions.burn.title'),
				icon: () => <Svg src={Burn} />,
				tabChildren: (
					<BurnTab
						amountToBurn={amountToBurn}
						setAmountToBurn={setAmountToBurn}
						burnLoadingState={burnLoadingState}
						targetCRatio={targetCRatio}
						maxBurnAmount={maxBurnAmount}
						snxPrice={snxPrice}
						stakedSNX={stakedSNX}
					/>
				),
			},
		],
		[
			amountToStake,
			amountToBurn,
			maxBurnAmount,
			maxCollateral,
			setAmountToBurn,
			setAmountToStake,
			snxPrice,
			stakedSNX,
			t,
			targetCRatio,
		]
	);
	return (
		<StructuredTab
			boxPadding={25}
			boxHeight={400}
			boxWidth={450}
			tabData={tabData}
			setPanelType={setPanelType}
		/>
	);
};

export default MintBurnBox;
