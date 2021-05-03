import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import useLPData from 'hooks/useLPData';
import { CryptoCurrency, Synths } from 'constants/currency';
import { formatPercent, toBigNumber } from 'utils/formatters/number';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import ClaimIcon from 'assets/svg/app/claim.svg';
import BurnIcon from 'assets/svg/app/burn.svg';

import { GlowingCircle } from 'styles/common';
import media from 'styles/media';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import Currency from 'components/Currency';

import useUserStakingData from 'hooks/useUserStakingData';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { LP } from 'sections/earn/types';
import useShortRewardsData from 'hooks/useShortRewardsData';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';

import { ActionsContainer as Container } from './common-styles';

const LayoutLayerOne: FC = () => {
	const { t } = useTranslation();

	const lpData = useLPData();
	const shortData = useShortRewardsData();
	const { stakingRewards, tradingRewards } = useUserStakingData();
	const { currentCRatio, targetCRatio } = useStakingCalculations();

	const gridItems: GridBoxProps[] = useMemo(() => {
		const aboveTargetCRatio = currentCRatio.isLessThanOrEqualTo(targetCRatio);
		return [
			{
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
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sBTC} width="32" height="32" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.loans.title', {
					percent: formatPercent(shortData[Synths.sBTC].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.loans.copy', {
					asset: Synths.sBTC,
					supplier: 'Synthetix',
				}),
				externalLink: ROUTES.Earn.sBTC_EXTERNAL,
				isDisabled: shortData[Synths.sBTC].APR === 0,
			},
			{
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sETH} width="32" height="32" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(shortData[Synths.sETH].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.loans.copy', { asset: Synths.sETH, supplier: 'Synthetix' }),
				externalLink: ROUTES.Earn.sETH_EXTERNAL,
				isDisabled: shortData[Synths.sETH].APR === 0,
			},
			{
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon
							currencyKey={CryptoCurrency.CRV}
							type={CurrencyIconType.TOKEN}
							width="28"
							height="28"
						/>
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.CURVE_sUSD].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Curve sUSD Pool Token',
					supplier: 'Curve Finance',
				}),
				tooltip: t('common.tooltip.external', { link: 'Curve Finance' }),
				externalLink: ROUTES.Earn.sUSD_EXTERNAL,
				isDisabled: lpData[LP.CURVE_sUSD].APR === 0,
			},
			{
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon
							currencyKey={CryptoCurrency.DHT}
							type={CurrencyIconType.TOKEN}
							width="28"
							height="28"
						/>
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.UNISWAP_DHT].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Uniswap DHT Pool Token',
					supplier: 'Uniswap',
				}),
				link: ROUTES.Earn.DHT_LP,
				isDisabled: lpData[LP.UNISWAP_DHT].APR === 0,
			},
			{
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sAAPL} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.BALANCER_sAAPL].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sAAPL Pool Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sAAPL_LP,
				isDisabled: lpData[LP.BALANCER_sAAPL].APR === 0,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-3', 'row-4'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sAMZN} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.BALANCER_sAMZN].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sAMZN Pool Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sAMZN_LP,
				isDisabled: lpData[LP.BALANCER_sAMZN].APR === 0,
			},
			{
				gridLocations: ['col-1', 'col-2', 'row-4', 'row-5'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sFB} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.BALANCER_sFB].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sFB Pool Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sFB_LP,
				isDisabled: lpData[LP.BALANCER_sFB].APR === 0,
			},
			{
				gridLocations: ['col-2', 'col-3', 'row-4', 'row-5'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sGOOG} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.BALANCER_sGOOG].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sGOOG Pool Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sGOOG_LP,
				isDisabled: lpData[LP.BALANCER_sGOOG].APR === 0,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-4', 'row-5'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sNFLX} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.BALANCER_sNFLX].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sNFLX Pool Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sNFLX_LP,
				isDisabled: lpData[LP.BALANCER_sNFLX].APR === 0,
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-4', 'row-5'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sMSFT} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.BALANCER_sMSFT].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sMSFT Pool Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sMSFT_LP,
				isDisabled: lpData[LP.BALANCER_sMSFT].APR === 0,
			},
			{
				gridLocations: ['col-1', 'col-2', 'row-5', 'row-6'],
				icon: (
					<GlowingCircle variant="green" size="md">
						<Currency.Icon currencyKey={Synths.sCOIN} width="28" height="28" />
					</GlowingCircle>
				),
				title: t('dashboard.actions.earn.title', {
					percent: formatPercent(lpData[LP.BALANCER_sCOIN].APR, { minDecimals: 0 }),
				}),
				copy: t('dashboard.actions.earn.copy', {
					asset: 'Balancer sCOIN Pool Token',
					supplier: 'Synthetix',
				}),
				link: ROUTES.Earn.sCOIN_LP,
				isDisabled: lpData[LP.BALANCER_sCOIN].APR === 0,
			},
		].map((cell, i) => ({ ...cell, gridArea: `tile-${i + 1}` }));
	}, [t, lpData, currentCRatio, targetCRatio, stakingRewards, tradingRewards, shortData]);

	return (
		<StyledContainer>
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</StyledContainer>
	);
};

const StyledContainer = styled(Container)`
	grid-template-areas:
		'tile-1 tile-2 tile-3 tile-4'
		'tile-5 tile-5 tile-6 tile-6'
		'tile-7 tile-8 tile-9 tile-10'
		'tile-11 tile-12 tile-13 tile-14'
		'tile-15 tile-16 tile-17 tile-18';
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr;
	gap: 1rem;

	${media.lessThan('mdUp')`
		grid-template-areas: 
			'tile-1 tile-2'
			'tile-3 tile-4'
			'tile-5 tile-6'
			'tile-7 tile-8'
			'tile-9 tile-10'
			'tile-11 tile-12'
			'tile-13 tile-14'
			'tile-15 tile-16';
		grid-template-columns: 1fr 1fr;
	`}
`;

export default LayoutLayerOne;
