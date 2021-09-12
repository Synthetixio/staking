import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';

import { formatPercent } from 'utils/formatters/number';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import ClaimIcon from 'assets/svg/app/claim.svg';
import BurnIcon from 'assets/svg/app/burn.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';

import { GlowingCircle } from 'styles/common';
import media from 'styles/media';

import useUserStakingData from 'hooks/useUserStakingData';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { ActionsContainer as Container } from './common-styles';
import { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

const LayoutLayerTwo: FC = () => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);

	const { stakingRewards, tradingRewards } = useUserStakingData(walletAddress);
	const { currentCRatio, targetCRatio } = useStakingCalculations();

	const gridItems: GridBoxProps[] = useMemo(() => {
		const aboveTargetCRatio = currentCRatio.lte(targetCRatio);
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
					stakingRewards.eq(0) && tradingRewards.eq(0)
						? t('dashboard.actions.claim.tooltip')
						: undefined,
				link: ROUTES.Earn.Claim,
				isDisabled: stakingRewards.eq(0) && tradingRewards.eq(0),
			},
			{
				icon: (
					<GlowingCircle variant={!aboveTargetCRatio ? 'orange' : 'blue'} size="md">
						{!aboveTargetCRatio ? <Svg src={BurnIcon} /> : <Svg src={MintIcon} />}
					</GlowingCircle>
				),
				title: !aboveTargetCRatio
					? t('dashboard.actions.burn.title', {
							targetCRatio: formatPercent(wei(1).div(targetCRatio), { minDecimals: 0 }),
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
				isDisabled: false,
			},
		].map((cell, i) => ({ ...cell, gridArea: `tile-${i + 1}` }));
	}, [t, currentCRatio, targetCRatio, stakingRewards, tradingRewards]);

	return (
		<StyledContainer>
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</StyledContainer>
	);
};

const StyledContainer = styled(Container)`
	grid-template-areas: 'tile-1 tile-2 tile-3';
	grid-template-columns: 1fr 1fr 1fr;
	gap: 1rem;

	${media.lessThan('md')`
		grid-template-areas:
			'tile-1 tile-2'
			'tile-3 tile-4';
		grid-template-columns: 1fr 1fr;
		display: grid;
    flex-direction: unset;
	`}
`;

export default LayoutLayerTwo;
