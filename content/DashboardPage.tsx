import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, LineSpacer } from 'styles/common';
import { PossibleActions } from 'sections/dashboard';

import StatBox from 'components/StatBox';
import StatsSection from 'components/StatsSection';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import StakedValue from 'sections/shared/modals/StakedValueModal/StakedValueBox';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';
import Connector from 'containers/Connector';

const DashboardPage: FC = () => {
  const { t } = useTranslation();
  const { walletAddress } = Connector.useContainer();

  const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
  const { stakedValue, stakingAPR, debtBalance } = useUserStakingData(walletAddress);

  return (
    <>
      <Head>
        <title>{t('dashboard.page-title')}</title>
      </Head>
      <Content>
        <StatsSection>
          <StakedValue
            title={t('common.stat-box.staked-value')}
            value={formatFiatCurrency(getPriceAtCurrentRate(stakedValue), {
              sign: selectedPriceCurrency.sign,
            })}
          />
          <APR
            title={t('common.stat-box.earning')}
            value={formatPercent(stakingAPR ? stakingAPR : 0)}
            size="lg"
          />
          <ActiveDebt
            title={t('common.stat-box.active-debt')}
            value={formatFiatCurrency(getPriceAtCurrentRate(debtBalance), {
              sign: selectedPriceCurrency.sign,
            })}
            isPink
          />
        </StatsSection>
        <LineSpacer />
        <PossibleActions />
      </Content>
    </>
  );
};

const Content = styled(FlexDivCol)`
  width: 100%;
  max-width: 1200px;
`;

const APR = styled(StatBox)`
  .title {
    color: ${(props) => props.theme.colors.green};
  }
  .value {
    text-shadow: ${(props) => props.theme.colors.greenTextShadow};
    color: #073124;
  }
`;

export default DashboardPage;
