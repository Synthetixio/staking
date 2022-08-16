import { FC } from 'react';
import styled from 'styled-components';

import media from 'styles/media';
import ProgressBar from 'components/ProgressBar';
import { ProgressBarType } from 'components/ProgressBar/ProgressBar';
import { FlexDivCol } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';
import Wei from '@synthetixio/wei';

type SynthHoldingProps = {
  usdBalance: Wei;
  totalUSDBalance: Wei;
  progressBarVariant?: ProgressBarType;
  showProgressBar?: boolean;
};

const SynthHolding: FC<SynthHoldingProps> = ({
  usdBalance,
  totalUSDBalance,
  progressBarVariant,
  showProgressBar = true,
}) => {
  const percent = usdBalance.div(totalUSDBalance);

  return (
    <Container>
      {!showProgressBar ? (
        <StyledPercentage>{formatPercent(percent)}</StyledPercentage>
      ) : (
        <>
          <StyledProgressBar
            percentage={percent.toNumber()}
            variant={progressBarVariant || 'rainbow'}
          />
          <StyledPercentage>{formatPercent(percent)}</StyledPercentage>
        </>
      )}
    </Container>
  );
};

const Container = styled(FlexDivCol)`
  width: 100%;

  ${media.lessThan('md')`
    display: grid;
    grid-template-columns: 2fr 1fr;
    align-items: center;
    grid-gap: 1rem;
  `}
`;

const StyledPercentage = styled.span`
  color: ${(props) => props.theme.colors.gray};
`;

const StyledProgressBar = styled(ProgressBar)`
  margin-bottom: 4px;
`;

export default SynthHolding;
