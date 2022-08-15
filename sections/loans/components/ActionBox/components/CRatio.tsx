import { FC } from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';
import InfoSVG from 'sections/loans/components/ActionBox/components/InfoSVG';
import Wei from '@synthetixio/wei';

type CRatioProps = {
  hasLowCRatio: boolean;
  cratio: Wei;
  minCRatio: Wei;
  safeMinCRatio: Wei;
};

const CRatio: FC<CRatioProps> = ({ cratio, hasLowCRatio, minCRatio, safeMinCRatio }) => {
  const { t } = useTranslation();

  return (
    <Container>
      <Header>{t('loans.cratio')}</Header>
      <FlexDivRowCentered>
        <Item>
          <Text {...{ hasLowCRatio }}>
            {cratio.eq(0) ? (
              '-'
            ) : (
              <>
                {formatPercent(cratio)}{' '}
                <InfoSVG
                  tip={
                    <Trans
                      i18nKey={
                        hasLowCRatio
                          ? 'loans.tabs.new.low-cratio-tip'
                          : 'loans.tabs.new.healthy-cratio-tip'
                      }
                      values={{
                        minCRatio: formatPercent(minCRatio),
                        safeMinCRatio: formatPercent(safeMinCRatio),
                      }}
                    />
                  }
                />
              </>
            )}
          </Text>
        </Item>
      </FlexDivRowCentered>
    </Container>
  );
};

const Container = styled(FlexDivRow)`
  width: 100%;
  justify-content: space-between;
`;

const Header = styled.p`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.gray};
  text-transform: uppercase;
`;

const Item = styled.div`
  display: inline-flex;
  align-items: center;

  svg {
    margin-left: 5px;
  }
`;

const Text = styled.div<{ hasLowCRatio: boolean }>`
  display: flex;
  align-items: center;
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => (props.hasLowCRatio ? props.theme.colors.red : props.theme.colors.green)};
`;

export default CRatio;
