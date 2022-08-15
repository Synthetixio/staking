import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';

import { formatPercent } from 'utils/formatters/number';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import BurnIcon from 'assets/svg/app/burn.svg';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';

import { GlowingCircle } from 'styles/common';
import media from 'styles/media';

import useUserStakingData from 'hooks/useUserStakingData';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { ActionsContainer as Container } from './common-styles';
import { wei } from '@synthetixio/wei';
import useLiquidationRewards from 'hooks/useLiquidationRewards';
import getSynthetixRewardTile from './getSynthetixRewardTile';
import Currency from 'components/Currency';
import { CryptoCurrency } from 'constants/currency';
import { LP } from 'sections/earn/types';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import useLPData from 'hooks/useLPData';
import { notNill } from 'utils/ts-helpers';
import Connector from 'containers/Connector';

const LayoutLayerTwo: FC = () => {
  const { t } = useTranslation();

  const { walletAddress } = Connector.useContainer();

  const liquidationRewardsQuery = useLiquidationRewards(walletAddress);
  const { stakingRewards, tradingRewards } = useUserStakingData(walletAddress);
  const { currentCRatio, targetCRatio } = useStakingCalculations();

  const lpData = useLPData();

  const liquidationRewards = liquidationRewardsQuery.data ?? wei(0);
  const stakingAndTradingRewards = stakingRewards.add(tradingRewards);
  const gridItems: GridBoxProps[] = useMemo(() => {
    const aboveTargetCRatio = currentCRatio.lte(targetCRatio);
    return [
      getSynthetixRewardTile(t, stakingAndTradingRewards, liquidationRewards),

      {
        icon: (
          <GlowingCircle variant={!aboveTargetCRatio ? 'orange' : 'blue'} size="md">
            {!aboveTargetCRatio ? <BurnIcon width="38" /> : <MintIcon width="27" />}
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
            <KwentaIcon width="32" />
          </GlowingCircle>
        ),
        title: t('dashboard.actions.trade.title'),
        copy: t('dashboard.actions.trade.copy'),
        externalLink: EXTERNAL_LINKS.Trading.Kwenta,
        isDisabled: false,
      },
      lpData[LP.CURVE_sUSD].APR && {
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
          percent: formatPercent(lpData[LP.CURVE_sUSD].APR, { minDecimals: 1 }),
        }),
        copy: t('dashboard.actions.earn.copy', {
          asset: 'Curve sUSD Pool Token',
          supplier: 'Curve Finance',
        }),
        tooltip: t('common.tooltip.external', { link: 'Curve Finance' }),
        externalLink: ROUTES.Earn.sUSD_EXTERNAL_OPTIMISM,
        isDisabled: lpData[LP.CURVE_sUSD].APR.eq(0),
      },
    ]
      .filter(notNill)
      .map((cell, i) => ({ ...cell, gridArea: `tile-${i + 1}` }));
  }, [currentCRatio, targetCRatio, t, stakingAndTradingRewards, liquidationRewards, lpData]);

  return (
    <StyledContainer>
      {gridItems.map((props, index) => (
        <GridBox key={`${props.title}-${index}`} {...props} />
      ))}
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  grid-template-areas: 'tile-1 tile-2 tile-3 tile-4';
  grid-template-columns: 1fr 1fr 1fr 1fr;
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
