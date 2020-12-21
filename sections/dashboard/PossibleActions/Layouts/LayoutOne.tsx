import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import useLPData from 'hooks/useLPData';
import { CryptoCurrency, Synths } from 'constants/currency';
import { formatPercent } from 'utils/formatters/number';

import Stake from 'assets/svg/app/stake.svg';
import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import ClaimIcon from 'assets/svg/app/claim.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import { GlowingCircle } from 'styles/common';
import Currency from 'components/Currency';

const LayoutOne: FC = () => {
	const { t } = useTranslation();

	const lpData = useLPData();

	const gridItems: GridBoxProps[] = useMemo(
		() => [
			{
				gridLocations: ['col-1', 'col-3', 'row-1', 'row-2'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Svg
							src={ClaimIcon}
							width="32"
							viewBox={`0 0 ${ClaimIcon.width} ${ClaimIcon.height}`}
						/>
					</GlowingCircle>
				),
				title: t('dashboard.actions.claim.title'),
				copy: t('dashboard.actions.claim.copy'),
				link: ROUTES.Earn.Claim,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-1', 'row-2'],
				icon: (
					<GlowingCircle variant="blue" size="md">
						<Svg src={MintIcon} />
					</GlowingCircle>
				),
				title: t('dashboard.actions.mint.title'),
				copy: t('dashboard.actions.mint.copy'),
				link: ROUTES.Staking.Home,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-1', 'row-2'],
				icon: (
					<GlowingCircle variant="orange" size="md">
						<Svg src={KwentaIcon} width="32" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.trade.title'),
				copy: t('dashboard.actions.trade.copy'),
				externalLink: EXTERNAL_LINKS.Trading.Kwenta,
			},
			{
				gridLocations: ['col-1', 'col-2', 'row-2', 'row-3'],
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
				gridLocations: ['col-2', 'col-3', 'row-2', 'row-3'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.iBTC} width="32" height="32" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[Synths.iBTC].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: Synths.iBTC,
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.iBTC_LP,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-2', 'row-3'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.iETH} width="32" height="32" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[Synths.iETH].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', { asset: Synths.iETH, supplier: 'Synthetix' }),
				link: ROUTES.Earn.iETH_LP,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-2', 'row-3'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={CryptoCurrency.CurveLPToken} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[CryptoCurrency.CurveLPToken].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Curve sUSD LP Token',
					supplier: 'Curve Finance',
				}),
				link: ROUTES.Earn.Curve_LP,
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
