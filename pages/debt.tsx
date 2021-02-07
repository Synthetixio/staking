import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, LineSpacer, StatsSection } from 'styles/common';

import StatBox from 'components/StatBox';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, toBigNumber, zeroBN } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import DebtChart from 'sections/debt/DebtChart';
import { last } from 'lodash';
import useHistoricalDebtData from 'hooks/useHistoricalDebtData';

const DashboardPage = () => {
  const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
  const { debtBalance: actualDebt } = useUserStakingData();
  const synthsBalancesQuery = useSynthsBalancesQuery();

	const historicalDebt = useHistoricalDebtData();

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
    : zeroBN;

  const issuedDebt = toBigNumber(last(historicalDebt)?.issuanceDebt ?? 0);

	return (
		<>
			<Head>
				<title>{t('debt.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					<IssuedDebt
						title={t('common.stat-box.issued-debt')}
						value={formatFiatCurrency(
							getPriceAtCurrentRate(issuedDebt),
							{
								sign: selectedPriceCurrency.sign,
							}
						)}
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatFiatCurrency(getPriceAtCurrentRate(actualDebt), {
							sign: selectedPriceCurrency.sign,
						})}
						size="lg"
					/>
					<TotalSynthValue
						title={t('common.stat-box.synth-value')}
						value={formatFiatCurrency(getPriceAtCurrentRate(totalSynthValue),
              {
                sign: selectedPriceCurrency.sign,
              }
            )}
					/>
				</StatsSection>
				<LineSpacer />
        
        <ChartSection>
          <Header>{t('debt.actions.track.title')}</Header>
				  <DebtChart data={historicalDebt}/>
        </ChartSection>
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

const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
`;

const TotalSynthValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.purple};
	}
`;

const Header = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 16px;
	padding-bottom: 20px;
`;

const ChartSection = styled.div`
  background: ${(props) => props.theme.colors.navy};
  padding: 32px;
`;

export default DashboardPage;
