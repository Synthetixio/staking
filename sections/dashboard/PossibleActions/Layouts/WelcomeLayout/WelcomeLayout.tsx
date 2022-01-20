import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';

import media from 'styles/media';
import { GlowingCircle } from 'styles/common';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import LearnIcon from 'assets/svg/app/learn.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';

import { ActionsContainer as Container } from '../common-styles';
import WizardGridBox from './WizardGridBox';

const WelcomeLayout: FC = () => {
	const { t } = useTranslation();

	const gridItems: GridBoxProps[] = useMemo(
		() => [
			{
				gridArea: 'tile-1',
				icon: (
					<GlowingCircle variant="blue" size="md">
						<Svg src={MintIcon} />
					</GlowingCircle>
				),
				title: t('dashboard.actions.stake.title'),
				copy: t('dashboard.actions.stake.copy'),
				link: ROUTES.Staking.Home,
			},
			{
				gridArea: 'tile-2',
				icon: (
					<GlowingCircle variant="yellow" size="md">
						<Svg src={LearnIcon} />
					</GlowingCircle>
				),
				title: t('dashboard.actions.learn.title'),
				copy: t('dashboard.actions.learn.copy'),
				externalLink: EXTERNAL_LINKS.Social.Blog,
			},
			{
				gridArea: 'tile-3',
				icon: (
					<GlowingCircle variant="orange" size="md">
						<Svg src={KwentaIcon} width="32" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.trade.title'),
				copy: t('dashboard.actions.trade.copy'),
				externalLink: EXTERNAL_LINKS.Trading.Kwenta,
			},
		],
		[t]
	);
	return (
		<StyledContainer>
			<WizardGridBox gridArea="main-tile" />
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</StyledContainer>
	);
};

const StyledContainer = styled(Container)`
	grid-template-areas:
		'main-tile tile-1 tile-1'
		'main-tile tile-2 tile-3';
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	gap: 1rem;

	${media.lessThan('mdUp')`
		grid-template-areas:
			'main-tile main-tile'
			'tile-1 tile-1'
			'tile-2 tile-3';
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 2fr 1fr 1fr;
	`}

	${media.lessThan('md')`
		grid-template-rows: unset;
	`}
`;

export default WelcomeLayout;
