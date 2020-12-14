import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';

import Stake from 'assets/svg/app/stake.svg';
import Trade from 'assets/svg/app/trade.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';

const WelcomeLayout: FC = () => {
	const { t } = useTranslation();

	const gridItems: GridBoxProps[] = useMemo(
		() => [
			{
				gridLocations: ['col-1', 'col-3', 'row-1', 'row-2'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.claim.title'),
				copy: t('dashboard.actions.claim.copy'),
				link: ROUTES.Earn.Claim,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-1', 'row-2'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.mint.title'),
				copy: t('dashboard.actions.mint.copy'),
				link: ROUTES.Staking.Home,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-1', 'row-2'],
				icon: <Svg src={Trade} />,
				title: t('dashboard.actions.trade.title'),
				copy: t('dashboard.actions.trade.copy'),
				externalLink: 'http://kwenta.io/',
			},
			{
				gridLocations: ['col-1', 'col-3', 'row-2', 'row-3'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.migrate.title'),
				copy: t('dashboard.actions.migrate.copy'),
				link: ROUTES.L2.Home,
			},
			// {
			// 	gridLocations: ['col-1', 'col-2', 'row-2', 'row-3'],
			// 	icon: () => <Svg src={Stake} />,
			// 	title: t('dashboard.actions.earn.title', { percent: '10%' }),
			// 	copy: t('dashboard.actions.earn.alt-copy', { synth: 'sUSD', supplier: 'Curve Finance' }),
			// 	link: ROUTES.Earn.Home,
			// },
			// {
			// 	gridLocations: ['col-2', 'col-3', 'row-2', 'row-3'],
			// 	icon: () => <Svg src={Stake} />,
			// 	title: t('dashboard.actions.earn.title', { percent: '14%' }),
			// 	copy: t('dashboard.actions.earn.copy', { synth: 'iETH' }),
			// 	link: ROUTES.Earn.Home,
			// },
			{
				gridLocations: ['col-3', 'col-4', 'row-2', 'row-3'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.earn.title', { percent: '6%' }),
				copy: t('dashboard.actions.earn.alt-copy', { synth: 'sBTC', supplier: 'Curve Finance' }),
				link: ROUTES.Earn.Home,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-2', 'row-3'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.earn.title', { percent: '65%' }),
				copy: t('dashboard.actions.earn.alt-copy', { synth: 'sETH', supplier: 'Uniswap' }),
				link: ROUTES.Earn.Home,
			},
		],
		[t]
	);
	return (
		<>
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</>
	);
};

export default WelcomeLayout;
