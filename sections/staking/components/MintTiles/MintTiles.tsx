import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Staking, { MintActionType } from 'sections/staking/context/StakingContext';
import Mint from 'assets/svg/app/mint.svg';
import { Svg } from 'react-optimized-image';
import ButtonTile from '../ButtonTile';
import { FlexDivCol } from 'styles/common';
import styled from 'styled-components';

type MintTilesProps = {};

const MintTiles: React.FC<MintTilesProps> = ({}) => {
	const { t } = useTranslation();
	const { mintType, onMintTypeChange, onMintChange } = Staking.useContainer();
	const MintIcon = () => <Svg src={Mint} />;

	useEffect(() => {
		onMintChange('');
	}, [mintType]);

	return (
		<Container>
			<StyledButtonTile
				title={t('staking.actions.mint.tiles.max.title')}
				subtext={t('staking.actions.mint.tiles.max.subtext')}
				icon={MintIcon}
				onAction={() => {
					onMintTypeChange(MintActionType.MAX);
				}}
			/>
			<StyledButtonTile
				title={t('staking.actions.mint.tiles.custom.title')}
				subtext={t('staking.actions.mint.tiles.custom.subtext')}
				icon={MintIcon}
				onAction={() => onMintTypeChange(MintActionType.CUSTOM)}
			/>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	width: 100%;
	flex: 1;
`;
const StyledButtonTile = styled(ButtonTile)`
	padding: 16px;
	flex: 1;
	margin: 16px 0px;
`;

export default MintTiles;
