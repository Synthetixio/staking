import { ReactNode } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { StyledTabButton } from 'components/Tab/Tab';
import { Col } from 'sections/gov/components/common';
import InfoIcon from 'assets/svg/app/info-pink.svg';

export type TabInfo = {
  title: string;
  description: string;
  tabChildren: ReactNode;
  key: string;
  blue: boolean;
  disabled?: boolean;
};

export type UnstructuredTabProps = {
  tabData: TabInfo;
};

const StyledTabButtonExtended = styled(StyledTabButton)`
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 20px;
  cursor: default;
`;

const StyledTextWrapper = styled.div`
  background: ${(props) => props.theme.colors.mutedPink};
  color: ${(props) => props.theme.colors.pink};
  font-size: 12px;
  border-left: 3px solid ${(props) => props.theme.colors.pink};
  display: flex;
  align-items: center;
  padding-right: 8px;
`;

const StyledText = styled.h2`
  color: ${(props) => props.theme.colors.pink};
  font-size: 8px;
  padding: 3px 10px;
  text-transform: uppercase;
  font-family: ${(props) => props.theme.fonts.extended};
  font-weight: bold;
`;

const Title = styled.h4`
  font-size: 14px;
  margin: 0;
  font-family: ${(props) => props.theme.fonts.extended};
`;

const Description = styled.h6`
  font-size: 8px;
  color: ${(props) => props.theme.colors.gray};
  margin: 0;
  text-align: left;
  text-transform: uppercase;
  font-family: ${(props) => props.theme.fonts.extended};
`;

const Wrapper = styled(Col)`
  background: ${(props) => props.theme.colors.navy};
  padding: 5px;
`;

export const UnstructuredTab = ({ tabData }: UnstructuredTabProps) => {
  const { title, tabChildren, key, disabled } = tabData;
  const { t } = useTranslation();
  return (
    <Col>
      <StyledTabButtonExtended title={title} disabled={disabled} active name={key}>
        <Col>
          <Title>{tabData.title}</Title>
          <Description>{tabData.description}</Description>
        </Col>
        <StyledTextWrapper>
          <StyledText>{t('gov.panel.proposals.info')}</StyledText>
          <InfoIcon width="14" />
        </StyledTextWrapper>
      </StyledTabButtonExtended>
      <Wrapper>{tabChildren}</Wrapper>
    </Col>
  );
};
