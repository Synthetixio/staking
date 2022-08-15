import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'styles/common';
import InfoIcon from 'assets/svg/app/info.svg';

type SVGProps = {
  tip: ReactNode;
};

const SVG: FC<SVGProps> = ({ tip }) => (
  <StyledTooltip arrow={true} placement="bottom" content={<TooltipText>{tip}</TooltipText>}>
    <SVGContainer>
      <InfoIcon width="12" />
    </SVGContainer>
  </StyledTooltip>
);

export default SVG;

const SVGContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const StyledTooltip = styled(Tooltip)`
  background: ${(props) => props.theme.colors.mediumBlue};
  .tippy-content {
    font-size: 12px;
    padding: 10px;
  }
`;

const TooltipText = styled.div`
  text-align: center;
`;
