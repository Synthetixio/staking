import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import useLPData from 'hooks/useLPData';
import { CryptoCurrency } from 'constants/currency';
import { formatPercent } from 'utils/formatters/number';

import KwentaIcon from 'assets/svg/app/kwenta.svg';
import MintIcon from 'assets/svg/app/mint.svg';
import BurnIcon from 'assets/svg/app/burn.svg';

import { GlowingCircle } from 'styles/common';
import media from 'styles/media';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import Currency from 'components/Currency';

import useUserStakingData from 'hooks/useUserStakingData';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { LP } from 'sections/earn/types';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';

import { ActionsContainer as Container } from './common-styles';
import { wei } from '@synthetixio/wei';
import getSynthetixRewardTile from './getSynthetixRewardTile';
import useLiquidationRewards from 'hooks/useLiquidationRewards';
import { notNill } from 'utils/ts-helpers';
import Connector from 'containers/Connector';

const LayoutLayerOne: FC = () => {
  const { t } = useTranslation();

  const { walletAddress } = Connector.useContainer();

  const liquidationRewardsQuery = useLiquidationRewards(walletAddress);

  const lpData = useLPData();
  const { stakingRewards, tradingRewards } = useUserStakingData(walletAddress);
  const { currentCRatio, targetCRatio } = useStakingCalculations();
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
      },
      {
        icon: (
          <GlowingCircle variant="blue" size="md">
            L2
          </GlowingCircle>
        ),
        title: t('dashboard.actions.migrate.title'),
        copy: t('dashboard.actions.migrate.copy'),
        link: ROUTES.EscrowMigrate.Home,
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
        externalLink: ROUTES.Earn.sUSD_EXTERNAL,
        isDisabled: lpData[LP.CURVE_sUSD].APR.eq(0),
      },
    ]
      .filter(notNill)
      .map((cell, i) => ({ ...cell, gridArea: `tile-${i + 1}` }));
  }, [t, lpData, currentCRatio, targetCRatio, stakingAndTradingRewards, liquidationRewards]);

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

  ${media.lessThan('md')`
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
    display: grid;
    flex-direction: unset;
  `}
`;

export default LayoutLayerOne;
