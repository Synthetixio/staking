import { FC, useMemo, useState } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import useLPData from 'hooks/useLPData';
import ROUTES from 'constants/routes';
import { CryptoCurrency } from 'constants/currency';
import media from 'styles/media';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';
import { TabButton, TabList } from 'components/Tab';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import { DesktopOrTabletView } from 'components/Media';

import IncentivesTable, { NOT_APPLICABLE } from './IncentivesTable';
import ClaimTab from './ClaimTab';
import { Tab, LP } from './types';
import YearnVaultTab from './LPTab/YearnVaultTab';
import { YearnVaultData } from 'queries/liquidityPools/useYearnSNXVaultQuery';
import Connector from 'containers/Connector';
import LiquidationTab from './LiquidationTab';
import { notNill } from 'utils/ts-helpers';
import { useGetTVL } from 'hooks/useGetTVL';

enum View {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

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
  const theme = useTheme();
  const [view, setView] = useState<View>(View.ACTIVE);
  const { isWalletConnected } = Connector.useContainer();

  const lpData = useLPData();
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

  const incentives = useMemo(() => {
    return isWalletConnected
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
          {
            title: t('earn.incentives.options.yvsnx.title'),
            subtitle: t('earn.incentives.options.yvsnx.subtitle'),
            apr: lpData[LP.YEARN_SNX_VAULT].APR,
            tvl: lpData[LP.YEARN_SNX_VAULT].TVL,
            staked: {
              balance: (lpData[LP.YEARN_SNX_VAULT].data as YearnVaultData)?.stakedSNX ?? wei(0),
              asset: CryptoCurrency.SNX,
              ticker: CryptoCurrency.SNX,
              type: CurrencyIconType.TOKEN,
            },
            rewards: lpData[LP.YEARN_SNX_VAULT].data?.rewards ?? wei(0),
            periodStarted: now - (lpData[LP.YEARN_SNX_VAULT].data?.duration ?? 0),
            periodFinish: lpData[LP.YEARN_SNX_VAULT].data?.periodFinish ?? 0,
            claimed: NOT_APPLICABLE,
            now,
            route: ROUTES.Earn.yearn_SNX_VAULT,
            tab: Tab.yearn_SNX_VAULT,
            neverExpires: true,
          },

          Boolean(lpData[LP.CURVE_sUSD].TVL && lpData[LP.CURVE_sUSD].APR)
            ? {
                title: t('earn.incentives.options.curve.title'),
                subtitle: t('earn.incentives.options.curve.subtitle'),
                apr: lpData[LP.CURVE_sUSD].APR,
                tvl: lpData[LP.CURVE_sUSD].TVL,
                staked: {
                  balance: lpData[LP.CURVE_sUSD].data?.staked ?? wei(0),
                  asset: CryptoCurrency.CRV,
                  ticker: LP.CURVE_sUSD,
                  type: CurrencyIconType.TOKEN,
                },
                rewards: lpData[LP.CURVE_sUSD].data?.rewards ?? wei(0),
                periodStarted: now - (lpData[LP.CURVE_sUSD].data?.duration ?? 0),
                periodFinish: lpData[LP.CURVE_sUSD].data?.periodFinish ?? 0,
                claimed: NOT_APPLICABLE,
                now,
                route: ROUTES.Earn.sUSD_LP,
                tab: Tab.sUSD_LP,
                externalLink: ROUTES.Earn.sUSD_EXTERNAL,
              }
            : undefined,
        ].filter(notNill)
      : [];
  }, [
    stakingAPR,
    stakedAmount,
    tvlQuery.data,
    nextFeePeriodStarts,
    stakingRewards,
    hasClaimed,
    lpData,
    currentFeePeriodStarted,
    now,
    t,
    isWalletConnected,
    liquidationRewards,
  ]);

  const incentivesTable = (
    <IncentivesTable
      activeTab={activeTab}
      data={
        view === View.ACTIVE
          ? incentives.filter((e) => e.periodFinish > Date.now())
          : incentives.filter((e) => e.periodFinish <= Date.now())
      }
      isLoaded={!!lpData[LP.CURVE_sUSD].APR}
    />
  );

  const yearnLpData = lpData[LP.YEARN_SNX_VAULT].data;
  return activeTab == null ? (
    <>
      <TabList noOfTabs={2}>
        <TabButton
          isSingle={false}
          tabHeight={50}
          inverseTabColor={true}
          color={theme.colors.blue}
          key={'active-button'}
          name={t('earn.tab.active')}
          active={view === View.ACTIVE}
          onClick={() => {
            setView(View.ACTIVE);
          }}
        >
          <TitleContainer>{t('earn.tab.active')}</TitleContainer>
        </TabButton>
        <TabButton
          isSingle={false}
          tabHeight={50}
          inverseTabColor={true}
          color={theme.colors.orange}
          key={'inactive-button'}
          name={t('earn.tab.inactive')}
          active={view === View.INACTIVE}
          onClick={() => {
            setView(View.INACTIVE);
          }}
        >
          <TitleContainer>{t('earn.tab.inactive')}</TitleContainer>
        </TabButton>
      </TabList>
      {incentivesTable}
    </>
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
        {activeTab === Tab.yearn_SNX_VAULT && (
          <YearnVaultTab
            userBalance={
              yearnLpData && 'userBalance' in yearnLpData ? yearnLpData.userBalance : wei(0)
            }
            stakedAsset={CryptoCurrency.SNX}
            allowance={yearnLpData && 'allowance' in yearnLpData ? yearnLpData.allowance : null}
            tokenRewards={lpData[LP.YEARN_SNX_VAULT].data?.rewards ?? wei(0)}
            staked={lpData[LP.YEARN_SNX_VAULT].data?.staked ?? wei(0)}
            pricePerShare={
              (lpData[LP.YEARN_SNX_VAULT].data as YearnVaultData)?.pricePerShare ?? wei(0)
            }
          />
        )}
      </TabContainer>
    </Container>
  );
};

const Container = styled.div`
  background-color: ${(props) => props.theme.colors.navy};
  ${media.greaterThan('md')`
    display: grid;
    grid-template-columns: 1fr 2fr;
  `}
`;

const TabContainer = styled.div`
  background-color: ${(props) => props.theme.colors.navy};
  min-height: 380px;
`;

const TitleContainer = styled.p`
  margin-left: 8px;
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.extended};
  text-transform: uppercase;
`;

export default Incentives;
