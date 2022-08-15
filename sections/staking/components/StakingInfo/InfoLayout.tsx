import { FC, useMemo } from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import { Trans, useTranslation } from 'react-i18next';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';
import { formatCurrency, formatPercent } from 'utils/formatters/number';
import { EXTERNAL_LINKS } from 'constants/links';
import { FlexDivCentered } from 'styles/common';
import { CryptoCurrency } from 'constants/currency';

import BarStatsRow from './BarStatsRow';

import {
  Title,
  Subtitle,
  StyledLink,
  DataContainer,
  DataRow,
  RowTitle,
  RowValue,
  ValueContainer,
  InfoContainer,
  InfoHeader,
} from '../common';
import { StakingPanelType } from 'store/staking';
import { intervalToDuration } from 'date-fns';

type BarChartData = {
  title: string;
  value: Wei;
  changedValue: Wei;
  percentage: Wei;
  changedPercentage: Wei;
  currencyKey: CryptoCurrency;
};

type RowData = {
  title: string;
  value: Wei;
  changedValue: Wei;
  currencyKey?: CryptoCurrency | string;
};

type StakingInfo = {
  barRows: BarChartData[];
  dataRows: RowData[];
};

type InfoLayoutProps = {
  stakingInfo: StakingInfo;
  collateral: Wei;
  isInputEmpty: boolean;
  infoType: StakingPanelType;
  minStakeTimeSec?: number;
  liquidationRatioPercent?: Wei;
  targetCratioPercent?: Wei;
};

const InfoLayout: FC<InfoLayoutProps> = ({
  stakingInfo,
  minStakeTimeSec,
  collateral,
  isInputEmpty,
  infoType,
  liquidationRatioPercent,
  targetCratioPercent,
}) => {
  const { t } = useTranslation();

  const title = useMemo(() => {
    switch (infoType) {
      case StakingPanelType.MINT:
        return t('staking.info.mint.title');
      case StakingPanelType.BURN:
        return t('staking.info.burn.title');
      case StakingPanelType.CLEAR:
        return t('staking.info.clear.title');
      case StakingPanelType.SELF_LIQUIDATE:
        return t('staking.info.self-liquidate.title');
    }
  }, [infoType, t]);

  const subtitle = useMemo(() => {
    switch (infoType) {
      case StakingPanelType.MINT:
        return 'staking.info.mint.subtitle';
      case StakingPanelType.BURN:
        return 'staking.info.burn.subtitle';
      case StakingPanelType.CLEAR:
        return 'staking.info.clear.subtitle';
      case StakingPanelType.SELF_LIQUIDATE:
        return 'staking.info.self-liquidate.subtitle';
    }
  }, [infoType]);

  return (
    <InfoContainer>
      <InfoHeader>
        <Title>{title}</Title>
        <Subtitle>
          <Trans
            i18nKey={subtitle}
            components={[
              <StyledLink href={EXTERNAL_LINKS.Synthetix.StakingGuide} />,
              <StyledLink href={EXTERNAL_LINKS.Synthetix.Litepaper} />,
            ]}
          />
        </Subtitle>
        {minStakeTimeSec && (
          <Subtitle>
            <NoMarginP>
              {t('staking.info.mint.min-stake-time', {
                duration: intervalToDuration({
                  start: 0,
                  end: minStakeTimeSec * 1000,
                }).days,
              })}
              .
            </NoMarginP>
            <StyledLink href={EXTERNAL_LINKS.Synthetix.HamalRelease}>
              {t('staking.info.mint.read-more')}
            </StyledLink>
          </Subtitle>
        )}
        {liquidationRatioPercent && targetCratioPercent && (
          <Subtitle>
            <NoMarginP>
              {t('staking.info.mint.liq-warning', {
                liquidationRatioPercent: formatPercent(liquidationRatioPercent),
                targetCratioPercent: formatPercent(targetCratioPercent),
              })}
              .
            </NoMarginP>
            <StyledLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
              {t('staking.info.mint.read-more')}
            </StyledLink>
          </Subtitle>
        )}
      </InfoHeader>
      <TotalBalanceContainer>
        <TotalBalanceHeading>{t('staking.info.table.total-snx')}</TotalBalanceHeading>
        <RowValue>
          {formatCurrency(CryptoCurrency.SNX, collateral, {
            currencyKey: CryptoCurrency.SNX,
          })}
        </RowValue>
      </TotalBalanceContainer>
      <DataContainer>
        {stakingInfo.barRows.map(
          ({ title, value, changedValue, percentage, changedPercentage, currencyKey }, i) => (
            <BarStatsRow
              key={`bar-stats-row-${i}`}
              title={title}
              value={formatCurrency(currencyKey, isInputEmpty ? value : changedValue, {
                currencyKey: currencyKey,
              })}
              percentage={isInputEmpty ? percentage.toNumber() : changedPercentage.toNumber()}
            />
          )
        )}
        {stakingInfo.dataRows.map(({ title, value, changedValue, currencyKey = '' }, i) => (
          <DataRow key={i}>
            <RowTitle>{title}</RowTitle>
            <ValueContainer>
              <RowValue>
                {formatCurrency(currencyKey, value.toString(), {
                  currencyKey: currencyKey,
                })}
              </RowValue>
              {!isInputEmpty && changedValue && (
                <>
                  <StyledArrowRight width="16" />
                  <RowValue>
                    {formatCurrency(currencyKey, changedValue, {
                      currencyKey: currencyKey,
                    })}
                  </RowValue>
                </>
              )}
            </ValueContainer>
          </DataRow>
        ))}
      </DataContainer>
    </InfoContainer>
  );
};

const TotalBalanceHeading = styled(RowTitle)`
  border-bottom: none;
  color: ${(props) => props.theme.colors.white};
`;

const StyledArrowRight = styled(ArrowRightIcon)`
  margin: 0 5px;
  color: ${(props) => props.theme.colors.blue};
`;

const TotalBalanceContainer = styled(FlexDivCentered)`
  padding: 0px 24px;
  justify-content: space-between;
  border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
`;
const NoMarginP = styled.p`
  margin: 0;
  padding: 0;
`;

export default InfoLayout;
