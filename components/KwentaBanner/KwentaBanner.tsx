import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import KwentaIcon from 'assets/svg/app/kwenta-full.svg';
import CaretRight from 'assets/svg/app/caret-right-gold.svg';

import { FlexDiv, FlexDivCentered, ExternalLink } from 'styles/common';
import { EXTERNAL_LINKS } from 'constants/links';
import media from 'styled-media-query';

const KwentaBanner: FC = () => {
  const { t } = useTranslation();
  return (
    <ExternalLink href={EXTERNAL_LINKS.Trading.KwentaTrading}>
      <Banner>
        <FlexDiv>
          {t('synths.trade-on-kwenta')}
          <StyledCaretRight width="16" />
        </FlexDiv>
        <div style={{ width: 100, height: 16 }}>
          <KwentaIcon />
        </div>
      </Banner>
    </ExternalLink>
  );
};

const Banner = styled(FlexDivCentered)`
  justify-content: space-between;
  border-top-width: 4px;
  border-top-style: solid;
  border-image: linear-gradient(180deg, #be9461 0%, #9c6c3c 100%) 1 stretch;
  background-color: ${(props) => props.theme.colors.mediumBlue};
  padding: 12px 32px;
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  ${media.lessThan('small')`
    padding:12px;
  `}
`;

const StyledCaretRight = styled(CaretRight)`
  margin: 0 12px;
`;

export default KwentaBanner;
