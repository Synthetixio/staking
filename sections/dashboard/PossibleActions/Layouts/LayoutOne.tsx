import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';
import useLPData from 'hooks/useLPData';
import { CryptoCurrency, Synths } from 'constants/currency';
import { formatPercent } from 'utils/formatters/number';

import Stake from 'assets/svg/app/stake.svg';
import Kwenta from 'assets/svg/app/kwenta.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';

const LayoutOne: FC = () => {
	const { t } = useTranslation();

	const lpData = useLPData();

	const gridItems: GridBoxProps[] = useMemo(
		() => [
			{
				gridLocations: ['col-1', 'col-3', 'row-1', 'row-2'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.claim.title'),
				copy: t('dashboard.actions.claim.copy'),
				link: ROUTES.Earn.Claim,
				visible: true,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-1', 'row-2'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.mint.title'),
				copy: t('dashboard.actions.mint.copy'),
				link: ROUTES.Staking.Home,
				visible: true,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-1', 'row-2'],
				icon: <Svg src={Kwenta} />,
				title: t('dashboard.actions.trade.title'),
				copy: t('dashboard.actions.trade.copy'),
				externalLink: 'http://kwenta.io/',
				visible: true,
			},
			{
				gridLocations: ['col-1', 'col-2', 'row-2', 'row-3'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.migrate.title'),
				copy: t('dashboard.actions.migrate.copy'),
				link: ROUTES.L2.Home,
				visible: true,
			},
			{
				gridLocations: ['col-2', 'col-3', 'row-2', 'row-3'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[Synths.iBTC].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: Synths.iBTC,
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.iBTC_LP,
				visible: true,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-2', 'row-3'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[Synths.iETH].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', { asset: Synths.iETH, supplier: 'Synthetix' }),
				link: ROUTES.Earn.iETH_LP,
				visible: true,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-2', 'row-3'],
				icon: <Svg src={Stake} />,
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[CryptoCurrency.CurveLPToken].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Curve sUSD LP Token',
					supplier: 'Curve Finance',
				}),
				link: ROUTES.Earn.Curve_LP,
				visible: true,
			},
		],
		[t, lpData]
	);
	return (
		<>
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</>
	);
};

export default LayoutOne;
