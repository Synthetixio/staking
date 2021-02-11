import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import useLPData from 'hooks/useLPData';
import { CryptoCurrency, Synths } from 'constants/currency';
import { formatPercent, toBigNumber } from 'utils/formatters/number';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import ClaimIcon from 'assets/svg/app/claim.svg';
import BurnIcon from 'assets/svg/app/burn.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import { GlowingCircle } from 'styles/common';
import Currency from 'components/Currency';
import useUserStakingData from 'hooks/useUserStakingData';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

const LayoutOne: FC = () => {
	const { t } = useTranslation();

	const lpData = useLPData();
	const { stakingRewards, tradingRewards } = useUserStakingData();
	const { currentCRatio, targetCRatio } = useStakingCalculations();

	const gridItems: GridBoxProps[] = useMemo(() => {
		const aboveTargetCRatio = currentCRatio.isLessThanOrEqualTo(targetCRatio);
		return [
			{
				gridLocations: ['col-1', 'col-2', 'row-1', 'row-2'],
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
				tooltip:
					stakingRewards.isZero() && tradingRewards.isZero()
						? t('dashboard.actions.claim.tooltip')
						: undefined,
				link: ROUTES.Earn.Claim,
				isDisabled: stakingRewards.isZero() && tradingRewards.isZero(),
			},
			{
				gridLocations: ['col-2', 'col-3', 'row-1', 'row-2'],
				icon: (
					<GlowingCircle variant={!aboveTargetCRatio ? 'orange' : 'blue'} size="md">
						{!aboveTargetCRatio ? <Svg src={BurnIcon} /> : <Svg src={MintIcon} />}
					</GlowingCircle>
				),
				title: !aboveTargetCRatio
					? t('dashboard.actions.burn.title', {
							targetCRatio: formatPercent(toBigNumber(1).div(targetCRatio), { minDecimals: 0 }),
					  })
					: t('dashboard.actions.mint.title'),
				copy: !aboveTargetCRatio
					? t('dashboard.actions.burn.copy')
					: t('dashboard.actions.mint.title'),
				link: !aboveTargetCRatio ? ROUTES.Staking.Burn : ROUTES.Staking.Mint,
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
			},
			{
				gridLocations: ['col-1', 'col-3', 'row-2', 'row-3'],
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
				gridLocations: ['col-3', 'col-5', 'row-2', 'row-3'],
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
				gridLocations: ['col-1', 'col-2', 'row-3', 'row-4'],
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
				externalLink: ROUTES.Earn.sUSD_EXTERNAL,
			},
			{
				gridLocations: ['col-2', 'col-3', 'row-3', 'row-4'],
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
				externalLink: ROUTES.Earn.sEURO_EXTERNAL,
			},
			{
				gridLocations: ['col-3', 'col-5', 'row-3', 'row-4'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sTSLA} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[Synths.sTSLA].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sTSLA LP Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sTLSA_LP,
			},
		];
	}, [t, lpData, currentCRatio, targetCRatio, stakingRewards, tradingRewards]);
	return (
		<>
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</>
	);
};

export default LayoutOne;
