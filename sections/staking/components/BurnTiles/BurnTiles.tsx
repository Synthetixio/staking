import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Burn from 'assets/svg/app/burn.svg';
import { Svg } from 'react-optimized-image';
import ButtonTile from '../ButtonTile';
import { FlexDivCol, FlexDivRow } from 'styles/common';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { formatPercent } from 'utils/formatters/number';
import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';
import { useRecoilState, useSetRecoilState } from 'recoil';

type BurnTilesProps = {
	percentageTargetCRatio: BigNumber;
	maxBurnAmount: BigNumber;
	burnAmountToFixCRatio: BigNumber;
};

const BurnTiles: React.FC<BurnTilesProps> = ({
	percentageTargetCRatio,
	maxBurnAmount,
	burnAmountToFixCRatio,
}) => {
	const { t } = useTranslation();
	const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);
	const onBurnChange = useSetRecoilState(amountToBurnState);

	const BurnIcon = () => <Svg src={Burn} />;

	useEffect(() => {
		onBurnChange('');
	}, [burnType]);

	return (
		<Container>
			<ButtonTile
				title={t('staking.actions.burn.tiles.max.title')}
				subtext={t('staking.actions.burn.tiles.max.subtext')}
				icon={BurnIcon}
				onAction={() => onBurnTypeChange(BurnActionType.MAX)}
			/>
			<FlexDivRow>
				<MarginedButtonTile
					left={true}
					disabled={
						maxBurnAmount.isZero() ||
						burnAmountToFixCRatio.isZero() ||
						burnAmountToFixCRatio.isGreaterThan(maxBurnAmount)
					}
					title={t('staking.actions.burn.tiles.target.title', {
						targetCRatio: formatPercent(percentageTargetCRatio),
					})}
					subtext={t('staking.actions.burn.tiles.target.subtext')}
					icon={BurnIcon}
					onAction={() => onBurnTypeChange(BurnActionType.MAX)}
				/>
				<MarginedButtonTile
					right={true}
					title={t('staking.actions.burn.tiles.custom.title')}
					subtext={t('staking.actions.burn.tiles.custom.subtext')}
					icon={BurnIcon}
					onAction={() => onBurnTypeChange(BurnActionType.CUSTOM)}
				/>
			</FlexDivRow>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	width: 100%;
	flex: 1;
`;

const MarginedButtonTile = styled(ButtonTile)<{ right?: boolean; left?: boolean }>`
	margin-right: ${(props) => props.left && `4px`};
	margin-left: ${(props) => props.right && `4px`};
	width: 50%;
`;

export default BurnTiles;
