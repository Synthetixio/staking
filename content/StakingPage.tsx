import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';

import Main from 'sections/staking';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import StakedValue from 'sections/shared/modals/StakedValueModal/StakedValueBox';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import StatBox from 'components/StatBox';
import ProgressBar from 'components/ProgressBar';
import SelfLiquidation from './SelfLiquidation';
import Connector from 'containers/Connector';

const StakingPage = () => {
  const { t } = useTranslation();
  const { isWalletConnected } = Connector.useContainer();
  const {
    stakedCollateralValue,
    percentageCurrentCRatio,
    debtBalance,
    percentCurrentCRatioOfTarget,
    percentageTargetCRatio,
    SNXRate,
    totalEscrowBalance,
    collateral,
  } = useStakingCalculations();

  const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

  return (
    <>
      <Head>
        <title>{t('staking.page-title')}</title>
      </Head>
      <StatsSection>
        <StakedValue
          title={t('common.stat-box.staked-value')}
          value={formatFiatCurrency(getPriceAtCurrentRate(stakedCollateralValue), {
            sign: selectedPriceCurrency.sign,
          })}
        />
        <CRatio
          title={t('common.stat-box.c-ratio')}
          value={isWalletConnected ? formatPercent(percentageCurrentCRatio) : '-%'}
          size="lg"
        >
          <CRatioProgressBar
            variant="blue-pink"
            percentage={percentCurrentCRatioOfTarget.toNumber()}
          />
        </CRatio>
        <ActiveDebt
          title={t('common.stat-box.active-debt')}
          value={formatFiatCurrency(getPriceAtCurrentRate(debtBalance), {
            sign: selectedPriceCurrency.sign,
          })}
          isPink
        />
      </StatsSection>
      <LineSpacer />
      <SelfLiquidation
        percentageTargetCRatio={percentageTargetCRatio}
        percentageCurrentCRatio={percentageCurrentCRatio}
        totalSNXBalance={collateral}
        debtBalance={debtBalance}
        SNXRate={SNXRate}
        escrowedSnx={totalEscrowBalance}
      />
      <Main />
    </>
  );
};

const CRatio = styled(StatBox)`
  .value {
    text-shadow: ${(props) => props.theme.colors.blueTextShadow};
    color: ${(props) => props.theme.colors.black};
  }
`;

export const CRatioProgressBar = styled(ProgressBar)`
  height: 6px;
  width: 100%;
  transform: translateY(12px);
  // match StatBox "lg" background size width
  max-width: 176px;
`;

export default StakingPage;
