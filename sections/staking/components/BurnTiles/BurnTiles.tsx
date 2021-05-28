import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';

import Img, { Svg } from 'react-optimized-image';

import BurnCircle from 'assets/svg/app/burn-circle.svg';
import BurnCustomCircle from 'assets/svg/app/burn-custom-circle.svg';
import BurnTargetCircle from 'assets/svg/app/burn-target-circle.svg';
import media from 'styles/media';
import { FlexDivCol } from 'styles/common';

import { formatPercent } from 'utils/formatters/number';

import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';
import { isL2State } from 'store/wallet';

import ButtonTile from '../ButtonTile';

type BurnTilesProps = {
	percentageTargetCRatio: BigNumber;
	burnAmountToFixCRatio: BigNumber;
};

const burnIcon = <Svg src={BurnCircle} />;
const burnCustomIcon = <Img src={BurnCustomCircle} />; // TODO: investigate why it doesn't render correctly with <Svg /> (ids were replaced to be unique)
const burnTargetIcon = <Svg src={BurnTargetCircle} />;

const BurnTiles: React.FC<BurnTilesProps> = ({ percentageTargetCRatio, burnAmountToFixCRatio }) => {
	const { t } = useTranslation();
	const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);
	const onBurnChange = useSetRecoilState(amountToBurnState);
	const isL2 = useRecoilValue(isL2State);

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
			<ButtonTile
				disabled={burnAmountToFixCRatio.isZero()}
				title={t('staking.actions.burn.tiles.target.title', {
					targetCRatio: formatPercent(percentageTargetCRatio),
				})}
				subtext={t('staking.actions.burn.tiles.target.subtext')}
				icon={burnTargetIcon}
				onAction={() => onBurnTypeChange(BurnActionType.TARGET)}
			/>
			<ButtonTile
				title={t('staking.actions.burn.tiles.custom.title')}
				subtext={t('staking.actions.burn.tiles.custom.subtext')}
				icon={burnCustomIcon}
				onAction={() => onBurnTypeChange(BurnActionType.CUSTOM)}
			/>
			<ButtonTile
				title={t('staking.actions.burn.tiles.clear-debt.title')}
				subtext={
					isL2
						? t('common.layer-2.not-available')
						: t('staking.actions.burn.tiles.clear-debt.subtext')
				}
				icon={burnIcon}
				onAction={() => onBurnTypeChange(BurnActionType.CLEAR)}
				disabled={isL2}
			/>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	width: 100%;
	flex: 1;

	${media.greaterThan('sm')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-column-gap: 1rem;
	`}

	${media.lessThan('sm')`
		display: flex;
		flex-direction: column;
	`}
`;

export default BurnTiles;
