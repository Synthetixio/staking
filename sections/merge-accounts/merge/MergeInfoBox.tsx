import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { StyledLink } from 'sections/earn/common';
import media from 'styles/media';
import { EXTERNAL_LINKS } from 'constants/links';

const InfoBox: FC = () => {
  const { t } = useTranslation();

  return (
    <Root>
      <Container>
        <ContainerHeader>
          <Title>{t('merge-accounts.merge.info.title')}</Title>
        </ContainerHeader>
        <ContainerBody>
          <Subtitle>
            <Trans
              i18nKey="merge-accounts.merge.info.description"
              components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
            />
          </Subtitle>
        </ContainerBody>
      </Container>
    </Root>
  );
};

export default InfoBox;

//

export const Root = styled.div`
  & > div {
    ${media.greaterThan('mdUp')`
      margin: 0 0 16px;
    `}

    ${media.lessThan('mdUp')`
      margin: 16px 0;
    `}
  }

  a,
  a:visited {
    color: ${(props) => props.theme.colors.blue};
    text-decoration: none;
  }
`;

export const Container = styled.div`
  background: ${(props) => props.theme.colors.navy};
`;

export const ContainerHeader = styled.div`
  padding: 16px;
`;

export const Title = styled.div`
  font-family: ${(props) => props.theme.fonts.extended};
  color: ${(props) => props.theme.colors.white};
  font-size: 14px;
`;
export const Subtitle = styled.div`
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.gray};
  font-size: 14px;
  margin-top: 12px;
`;

export const ContainerBody = styled.div`
  padding: 16px;
`;
