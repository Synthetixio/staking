import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import useLPData from 'hooks/useLPData';
import { CryptoCurrency, Synths } from 'constants/currency';
import { formatPercent } from 'utils/formatters/number';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MigrateIcon from 'assets/svg/app/migrate.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import { GlowingCircle } from 'styles/common';
import Currency from 'components/Currency';

const L1MigrationLayout: FC = () => {
	const { t } = useTranslation();

	const lpData = useLPData();

	const gridItems: GridBoxProps[] = useMemo(
		() => [
			{
				gridLocations: ['col-1', 'col-3', 'row-1', 'row-3'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Svg
							src={MigrateIcon}
							width="32"
							viewBox={`0 0 ${MigrateIcon.width} ${MigrateIcon.height}`}
						/>
					</GlowingCircle>
				),
				title: t('dashboard.actions.migrate-l1.title'),
				copy: t('dashboard.actions.migrate-l1.copy'),
				tooltip: t('dashboard.actions.migrate-l1.tooltip'),
				link: ROUTES.Escrow.Home,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-1', 'row-2'],
				icon: (
					<GlowingCircle variant="orange" size="md">
						<Svg src={KwentaIcon} width="32" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.trade.title'),
				copy: t('dashboard.actions.trade.copy'),
				externalLink: EXTERNAL_LINKS.Trading.Kwenta,
				isDisabled: true,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-1', 'row-2'],
				icon: (
					<GlowingCircle variant="blue" size="md">
						L2
					</GlowingCircle>
				),
				title: t('dashboard.actions.migrate.title'),
				copy: t('dashboard.actions.migrate.copy'),
				link: ROUTES.L2.Home,
				tooltip: t('dashboard.actions.migrate.tooltip'),
				isDisabled: true,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-2', 'row-3'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={CryptoCurrency.CRV} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[Synths.sUSD].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Curve sUSD LP Token',
					supplier: 'Curve Finance',
				}),
				tooltip: t('common.tooltip.external', { link: 'Curve Finance' }),
				link: ROUTES.Earn.sUSD_EXTERNAL,
				isDisabled: true,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-2', 'row-3'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={CryptoCurrency.CRV} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[Synths.sEUR].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Curve sEUR LP Token',
					supplier: 'Curve Finance',
				}),
				tooltip: t('common.tooltip.external', { link: 'Curve Finance' }),
				link: ROUTES.Earn.sEURO_EXTERNAL,
				isDisabled: true,
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

export default L1MigrationLayout;
