import { useRecoilState, useSetRecoilState } from 'recoil';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';

import Img, { Svg } from 'react-optimized-image';

import BurnCircle from 'assets/svg/app/burn-circle.svg';
import BurnCustomCircle from 'assets/svg/app/burn-custom-circle.svg';
import BurnTargetCircle from 'assets/svg/app/burn-target-circle.svg';

import { FlexDivCol, FlexDivRow } from 'styles/common';

import { formatPercent } from 'utils/formatters/number';

import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';

import ButtonTile from '../ButtonTile';

type BurnTilesProps = {
	percentageTargetCRatio: BigNumber;
	maxBurnAmount: BigNumber;
	burnAmountToFixCRatio: BigNumber;
};

const burnIcon = <Svg src={BurnCircle} />;
const burnCustomIcon = <Img src={BurnCustomCircle} />; // TODO: investigate why it doesn't render correctly with <Svg /> (ids were replaced to be unique)
const burnTargetIcon = <Svg src={BurnTargetCircle} />;

const BurnTiles: React.FC<BurnTilesProps> = ({
	percentageTargetCRatio,
	maxBurnAmount,
	burnAmountToFixCRatio,
}) => {
	const { t } = useTranslation();
	const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);
	const onBurnChange = useSetRecoilState(amountToBurnState);

	useEffect(() => {
		onBurnChange('');
	}, [burnType, onBurnChange]);

	return (
		<Container>
			<ButtonTile
				title={t('staking.actions.burn.tiles.max.title')}
				subtext={t('staking.actions.burn.tiles.max.subtext')}
				icon={burnIcon}
				onAction={() => onBurnTypeChange(BurnActionType.MAX)}
			/>
			<FlexDivRow>
				<MarginedButtonTile
					left={true}
					disabled={burnAmountToFixCRatio.isZero()}
					title={t('staking.actions.burn.tiles.target.title', {
						targetCRatio: formatPercent(percentageTargetCRatio),
					})}
					subtext={t('staking.actions.burn.tiles.target.subtext')}
					icon={burnTargetIcon}
					onAction={() => onBurnTypeChange(BurnActionType.TARGET)}
				/>
				<MarginedButtonTile
					right={true}
					title={t('staking.actions.burn.tiles.custom.title')}
					subtext={t('staking.actions.burn.tiles.custom.subtext')}
					icon={burnCustomIcon}
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
	margin-right: ${(props) => props.left && `8px`};
	margin-left: ${(props) => props.right && `8px`};
	width: 50%;
`;

export default BurnTiles;
