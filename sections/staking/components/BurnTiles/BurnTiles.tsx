import React from 'react';
import { useTranslation } from 'react-i18next';
import Staking, { BurnActionType } from 'sections/staking/context/StakingContext';
import Burn from 'assets/svg/app/burn.svg';
import { Svg } from 'react-optimized-image';
import ButtonTile from '../ButtonTile';
import { FlexDivCol, FlexDivRow } from 'styles/common';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { formatPercent } from 'utils/formatters/number';

type BurnTilesProps = {
	percentageTargetCRatio: BigNumber;
};

const BurnTiles: React.FC<BurnTilesProps> = ({ percentageTargetCRatio }) => {
	const { t } = useTranslation();
	const { onBurnTypeChange } = Staking.useContainer();
	const BurnIcon = () => <Svg src={Burn} />;
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
