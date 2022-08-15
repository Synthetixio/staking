import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { ExternalLink } from '../../../../styles/common';
import { EXTERNAL_LINKS } from '../../../../constants/links';
import { handleSwitchChain } from '@synthetixio/providers';
import Connector from '../../../../containers/Connector';
import { providers } from 'ethers';

export default function HedgeTapMainnet() {
  const { t } = useTranslation();
  const { provider } = Connector.useContainer();
  return (
    <StyledHedgeWrapper>
      <Headline>{t('debt.actions.manage.l1-deprecation.headline')}</Headline>
      <SubHeadline>{t('debt.actions.manage.l1-deprecation.sub-headline')}</SubHeadline>
      <StyledLink
        onClick={(e) => {
          e.preventDefault();
          handleSwitchChain(provider as providers.Web3Provider, false);
        }}
      >
        {t('debt.actions.manage.l1-deprecation.switch-link')}
      </StyledLink>
      <SubHeadline>{t('debt.actions.manage.l1-deprecation.second-sub-headline')}</SubHeadline>

      <ol>
        <li>
          {t('debt.actions.manage.l1-deprecation.step-1')}{' '}
          <StyledExternalLink href={EXTERNAL_LINKS.multichain.app}>
            {EXTERNAL_LINKS.multichain.app}
          </StyledExternalLink>
        </li>
        <li>{t('debt.actions.manage.l1-deprecation.step-2')}</li>
        <li>
          {t('debt.actions.manage.l1-deprecation.step-3')}{' '}
          <StyledExternalLink href={EXTERNAL_LINKS.dHedge.dSNXPool}>
            {t('debt.actions.manage.l1-deprecation.link-text')}
          </StyledExternalLink>
        </li>
      </ol>
    </StyledHedgeWrapper>
  );
}

const SubHeadline = styled.h3`
  font-weight: bold;
  color: white;
  margin-bottom: 0;
`;

const StyledLink = styled(ExternalLink)`
  color: ${(props) => props.theme.colors.pink};
  cursor: pointer;
  margin-top: 10px;
`;
const StyledHedgeWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #828295;
  font-family: Inter;
  font-size: 14px;
  text-transform: initial;
`;

const Headline = styled.h2`
  color: white;
`;
const StyledExternalLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.colors.blue};
  &:hover {
    text-decoration: none;
  }
`;
