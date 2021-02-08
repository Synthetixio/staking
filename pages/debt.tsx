import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { FlexDiv, FlexDivCol, LineSpacer, StatsSection, Tooltip } from 'styles/common';

import StatBox from 'components/StatBox';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, toBigNumber, zeroBN } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import DebtChart from 'sections/debt/DebtChart';
import { last } from 'lodash';
import useHistoricalDebtData from 'hooks/useHistoricalDebtData';

import Info from 'assets/svg/app/info.svg'

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
        <FlexDiv>
        	<Header>{t('debt.actions.track.title')}</Header>
          <DebtInfoTooltip
						arrow={false}
            content={
              <Trans
                i18nKey="debt.actions.track.info.tooltip"
                components={[<Strong />, <br />, <Strong />]}
              ></Trans>
            }>
            <TooltipIconContainer>
              <ResizedInfoIcon 
                src={Info}
              />
            </TooltipIconContainer>
          </DebtInfoTooltip>
        </FlexDiv>
        <ChartSection>
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
  .value {
		text-shadow: ${(props) => props.theme.colors.pinkTextShadow};
    color: ${(props) => props.theme.colors.navy};
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

const DebtInfoTooltip = styled(Tooltip)`
  background: ${(props) => props.theme.colors.navy};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.navy};
	}
	.tippy-content {
		font-size: 14px;
	}
`

const TooltipIconContainer = styled.div`
	margin-left: 10px;
	width: 23px;
  height: 23px;
  opacity: 0.60;
`;

const ResizedInfoIcon = styled(Svg)`
  transform: scale(2) translateX(2.5px);
`

const Strong = styled.strong`
    font-family: ${(props) => props.theme.fonts.interBold};
`;

export default DashboardPage;
