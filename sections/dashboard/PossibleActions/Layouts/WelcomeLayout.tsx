import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import LearnIcon from 'assets/svg/app/learn.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import { GlowingCircle } from 'styles/common';

import WizardGridBox from './WizardGridBox';

const WelcomeLayout: FC = () => {
	const { t } = useTranslation();

	const gridItems: GridBoxProps[] = useMemo(
		() => [
			{
				gridLocations: ['col-3', 'col-5', 'row-1', 'row-2'],
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
				gridLocations: ['col-3', 'col-5', 'row-2', 'row-3'],
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
				gridLocations: ['col-3', 'col-5', 'row-3', 'row-4'],
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
		<>
			<WizardGridBox gridLocations={['col-1', 'col-3', 'row-1', 'row-4']} gridArea="main-tile" />
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</>
	);
};

export default WelcomeLayout;
