import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import ROUTES from 'constants/routes';
import { formatPercent } from 'utils/formatters/number';

import MintIcon from 'assets/svg/app/mint.svg';
import BurnIcon from 'assets/svg/app/burn.svg';

import { GlowingCircle } from 'styles/common';
import media from 'styles/media';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';

import { delegateWalletState } from 'store/wallet';
import useUserStakingData from 'hooks/useUserStakingData';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { ActionsContainer as Container } from './common-styles';
import { wei } from '@synthetixio/wei';
import useLiquidationRewards from 'hooks/useLiquidationRewards';
import getSynthetixRewardTile from './getSynthetixRewardTile';

const LayoutDelegate: FC = () => {
  const { t } = useTranslation();

  const { currentCRatio, targetCRatio } = useStakingCalculations();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const liquidationRewardsQuery = useLiquidationRewards(delegateWallet?.address ?? null);
  const { stakingRewards, tradingRewards } = useUserStakingData(delegateWallet?.address ?? null);

  const liquidationRewards = liquidationRewardsQuery.data ?? wei(0);
  const stakingAndTradingRewards = stakingRewards.add(tradingRewards);
  const gridItems: GridBoxProps[] = useMemo(() => {
    const aboveTargetCRatio = currentCRatio.lte(targetCRatio);
    return [
      getSynthetixRewardTile(
        t,
        stakingAndTradingRewards,
        liquidationRewards,
        !delegateWallet?.canClaim
      ),
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
        isDisabled:
          (!aboveTargetCRatio && !delegateWallet?.canBurn) ||
          (aboveTargetCRatio && !delegateWallet?.canMint),
      },
    ].map((cell, i) => ({ ...cell, gridArea: `tile-${i + 1}` }));
  }, [
    t,
    currentCRatio,
    targetCRatio,
    stakingAndTradingRewards,
    liquidationRewards,
    delegateWallet?.canClaim,
    delegateWallet?.canBurn,
    delegateWallet?.canMint,
  ]);

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

export default LayoutDelegate;
