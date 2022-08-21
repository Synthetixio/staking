import { useEffect, FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Connector from 'containers/Connector';

import StatBox from 'components/StatBox';
import { LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useUserStakingData from 'hooks/useUserStakingData';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import StakedValue from 'sections/shared/modals/StakedValueModal/StakedValueBox';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';

import Main from 'sections/loans/index';
import Loans from 'containers/Loans';

type LoansPageProps = {};

const LoansPage: FC<LoansPageProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const { walletAddress } = Connector.useContainer();

  const { stakedCollateralValue, debtBalance } = useStakingCalculations();
  const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
  const { stakingAPR } = useUserStakingData(walletAddress);

  useEffect(() => {
    if (router.asPath === '/loans') {
      router.push('/loans/new');
    }
  }, [router, router.asPath, router.push]);

  return (
    <>
      <Head>
        <title>{t('loans.page-title')}</title>
      </Head>
      <StatsSection>
        <StakedValue
          title={t('common.stat-box.staked-value')}
          value={formatFiatCurrency(getPriceAtCurrentRate(stakedCollateralValue), {
            sign: selectedPriceCurrency.sign,
          })}
          isGreen
        />
        <Earning
          title={t('common.stat-box.earning')}
          value={formatPercent(stakingAPR ? stakingAPR : 0)}
          size="lg"
        />
        <ActiveDebt
          title={t('common.stat-box.active-debt')}
          value={formatFiatCurrency(getPriceAtCurrentRate(debtBalance), {
            sign: selectedPriceCurrency.sign,
          })}
          isGreen
        />
      </StatsSection>
      <LineSpacer />
      <Main />
    </>
  );
};

const LoansWithContainer: FC<LoansPageProps> = (props) => {
  return (
    <Loans.Provider>
      <LoansPage {...props} />
    </Loans.Provider>
  );
};

const Earning = styled(StatBox)`
  .title {
    color: ${(props) => props.theme.colors.green};
  }
  .value {
    text-shadow: ${(props) => props.theme.colors.greenTextShadow};
    color: #073124;
  }
`;

export default LoansWithContainer;
