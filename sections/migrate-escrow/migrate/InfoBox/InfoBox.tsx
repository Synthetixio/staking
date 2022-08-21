import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { InfoContainer, Title } from '../../components/common';
import { FlexDivCol } from 'styles/common';
import Warning from 'assets/svg/app/warning.svg';

const InfoBox = () => {
  const { t } = useTranslation();
  return (
    <InfoContainer>
      <InfoContainerHeader>
        <Title>{t('migrate-escrow.info.title')}</Title>
      </InfoContainerHeader>
      <InfoContainerBody>
        <Warning width="72" />
        <WarningHeading>{t('migrate-escrow.info.warning-title')}</WarningHeading>
        <WarningBody>{t('migrate-escrow.info.metamask-only')}</WarningBody>
        <WarningBody>{t('migrate-escrow.info.warning-description')}</WarningBody>
      </InfoContainerBody>
    </InfoContainer>
  );
};

const InfoContainerHeader = styled(FlexDivCol)`
  border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
  padding-bottom: 12px;
`;

const InfoContainerBody = styled(FlexDivCol)`
  padding: 0 20px;
  margin: 42px auto;
  align-items: center;
  text-align: center;
`;

const Bold = css`
  font-family: ${(props) => props.theme.fonts.condensedBold};
`;

const WarningHeading = styled.h2`
  color: ${(props) => props.theme.colors.pink};
  margin: 14px 0;
  ${Bold};
`;

const WarningBody = styled.p`
  margin: 0;
  font-size: 14px;
  &:not(:first-child) {
    margin-top: 6px;
  }
`;

export default InfoBox;
