import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import last from 'lodash/last';

import { FlexDivCol, LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import StatBox from 'components/StatBox';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import useHistoricalDebtData from 'hooks/useHistoricalDebtData';
import Main from 'sections/debt';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';

const DebtPage: FC = () => {
  const { t } = useTranslation();
  const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

  const { walletAddress } = Connector.useContainer();

  const { useSynthsBalancesQuery } = useSynthetixQueries();

  const { debtBalance: actualDebt } = useUserStakingData(walletAddress);
  const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);

  const historicalDebt = useHistoricalDebtData(walletAddress);

  const totalSynthValue = synthsBalancesQuery.isSuccess
    ? synthsBalancesQuery.data?.totalUSDBalance ?? wei(0)
    : wei(0);

  const dataIsLoading = historicalDebt?.isLoading ?? false;
  const issuedDebt = dataIsLoading ? wei(0) : wei(last(historicalDebt.data)?.issuanceDebt ?? 0);

  return (
    <>
      <Head>
        <title>{t('debt.page-title')}</title>
      </Head>
      <Content>
        <StatsSection>
          <IssuedDebt
            title={t('common.stat-box.issued-debt')}
            value={formatFiatCurrency(getPriceAtCurrentRate(issuedDebt), {
              sign: selectedPriceCurrency.sign,
            })}
          />
          <ActiveDebt
            title={t('common.stat-box.active-debt')}
            value={formatFiatCurrency(getPriceAtCurrentRate(actualDebt), {
              sign: selectedPriceCurrency.sign,
            })}
            size="lg"
            isPink
          />
          <TotalSynthValue
            title={t('common.stat-box.synth-value')}
            value={formatFiatCurrency(getPriceAtCurrentRate(totalSynthValue), {
              sign: selectedPriceCurrency.sign,
            })}
          />
        </StatsSection>
        <LineSpacer />
        <Main />
      </Content>
    </>
  );
};

const Content = styled(FlexDivCol)`
  width: 100%;
  max-width: 1200px;
`;

const IssuedDebt = styled(StatBox)`
  .title {
    color: ${(props) => props.theme.colors.blue};
  }
`;

const TotalSynthValue = styled(StatBox)`
  .title {
    color: ${(props) => props.theme.colors.purple};
  }
`;

export default DebtPage;
