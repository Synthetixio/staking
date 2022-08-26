import { FC, useMemo } from 'react';
import Wei from '@synthetixio/wei';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import ROUTES from 'constants/routes';
import { CryptoCurrency } from 'constants/currency';
import media from 'styles/media';
import { delegateWalletState } from 'store/wallet';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';
import IncentivesTable, { NOT_APPLICABLE } from './IncentivesTable';
import ClaimTab from './ClaimTab';
import LiquidationTab from './LiquidationTab';
import { LP, Tab } from './types';
import { DesktopOrTabletView } from 'components/Media';
import Connector from 'containers/Connector';
import useCurveSusdPoolQuery from 'queries/liquidityPools/useCurveSusdPoolQuery';
import { notNill } from 'utils/ts-helpers';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import { useGetTVL } from 'hooks/useGetTVL';

type IncentivesProps = {
  tradingRewards: Wei;
  stakingRewards: Wei;
  totalRewards: Wei;
  liquidationRewards: Wei;
  stakingAPR: Wei;
  stakedAmount: Wei;
  hasClaimed: boolean;
  refetchAllRewards: () => void;
};

const VALID_TABS = Object.values(Tab);

const Incentives: FC<IncentivesProps> = ({
  tradingRewards,
  stakingRewards,
  totalRewards,
  stakingAPR,
  stakedAmount,
  hasClaimed,
  liquidationRewards,
  refetchAllRewards,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const { isWalletConnected } = Connector.useContainer();
  const curvesUSDPoolQuery = useCurveSusdPoolQuery();
  const tvlQuery = useGetTVL();

  const { nextFeePeriodStarts, currentFeePeriodStarted } = useFeePeriodTimeAndProgress();

  const now = useMemo(() => new Date().getTime(), []);

  const activeTab = useMemo(
    () =>
      isWalletConnected &&
      Array.isArray(router.query.pool) &&
      router.query.pool.length &&
      VALID_TABS.includes(router.query.pool[0] as Tab)
        ? (router.query.pool[0] as Tab)
        : null,
    [router.query.pool, isWalletConnected]
  );
  const curveData = curvesUSDPoolQuery.data;
  const incentives = useMemo(
    () =>
      isWalletConnected
        ? [
            {
              title: t('earn.incentives.options.snx.title'),
              subtitle: t('earn.incentives.options.snx.subtitle'),
              apr: stakingAPR,
              tvl: tvlQuery.data,
              staked: {
                balance: stakedAmount,
                asset: CryptoCurrency.SNX,
                ticker: CryptoCurrency.SNX,
              },
              rewards: stakingRewards,
              periodStarted: currentFeePeriodStarted.getTime(),
              periodFinish: nextFeePeriodStarts.getTime(),
              claimed: hasClaimed,
              now,
              tab: Tab.Claim,
              route: ROUTES.Earn.Claim,
            },
            {
              title: t('earn.incentives.options.liquidations.title'),
              subtitle: t('earn.incentives.options.liquidations.subtitle'),
              apr: undefined,
              tvl: tvlQuery.data,
              staked: {
                balance: stakedAmount,
                asset: CryptoCurrency.SNX,
                ticker: CryptoCurrency.SNX,
              },
              rewards: liquidationRewards,
              periodStarted: 0,
              periodFinish: Number.MAX_SAFE_INTEGER, // trick it to never expire
              claimed: NOT_APPLICABLE,
              now,
              route: ROUTES.Earn.LIQUIDATION_REWARDS,
              tab: Tab.LIQUIDATION_REWARDS,
              neverExpires: true,
            },
            // This component in used for both delegate wallets and optimism, we only want curve incentives to show up for non delegated wallets
            !delegateWallet?.address && curveData !== undefined
              ? {
                  title: t('earn.incentives.options.curve.title'),
                  subtitle: t('earn.incentives.options.curve.subtitle'),
                  apr: curveData.APR,
                  tvl: curveData.TVL,
                  staked: {
                    balance: undefined,
                    asset: CryptoCurrency.CRV,
                    ticker: LP.CURVE_sUSD,
                    type: CurrencyIconType.TOKEN,
                  },
                  rewards: undefined,
                  periodStarted: 0,
                  periodFinish: Number.MAX_SAFE_INTEGER,
                  claimed: NOT_APPLICABLE,
                  now,
                  route: ROUTES.Earn.sUSD_LP,
                  tab: Tab.sUSD_LP,
                  externalLink: ROUTES.Earn.sUSD_EXTERNAL_OPTIMISM,
                  neverExpires: true,
                }
              : undefined,
          ].filter(notNill)
        : [],
    [
      isWalletConnected,
      t,
      stakingAPR,
      tvlQuery.data,
      stakedAmount,
      stakingRewards,
      currentFeePeriodStarted,
      nextFeePeriodStarts,
      hasClaimed,
      now,
      liquidationRewards,
      delegateWallet?.address,
      curveData,
    ]
  );

  const incentivesTable = (
    <IncentivesTable activeTab={activeTab} data={incentives} isLoaded={true} />
  );

  return activeTab === null ? (
    <>{incentivesTable}</>
  ) : (
    <Container>
      <DesktopOrTabletView>{incentivesTable}</DesktopOrTabletView>
      <TabContainer>
        {activeTab === Tab.Claim && (
          <ClaimTab
            tradingRewards={tradingRewards}
            stakingRewards={stakingRewards}
            totalRewards={totalRewards}
            refetchAllRewards={refetchAllRewards}
            hasClaimed={hasClaimed}
          />
        )}
        {activeTab === Tab.LIQUIDATION_REWARDS && (
          <LiquidationTab
            liquidationRewards={liquidationRewards}
            refetchAllRewards={refetchAllRewards}
          />
        )}
      </TabContainer>
    </Container>
  );
};

const Container = styled.div`
  background-color: ${(props) => props.theme.colors.navy};
  display: grid;
  ${media.greaterThan('md')`
    display: grid;
    grid-template-columns: 1fr 2fr;
  `}
`;

const TabContainer = styled.div`
  background-color: ${(props) => props.theme.colors.navy};
  min-height: 380px;
`;

export default Incentives;
