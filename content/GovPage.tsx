import Head from 'next/head';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { ExternalLink, LineSpacer } from 'styles/common';
import MainContent from 'sections/gov';
import { EXTERNAL_LINKS } from 'constants/links';

const GovPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('gov.page-title')}</title>
      </Head>
      <NewElectionsContainer>
        <h2>{t('gov.new-governance-site.title')}</h2>
        <p>{t('gov.new-governance-site.subtitle')}</p>
        <Trans
          i18nKey={'gov.new-governance-site.link-text'}
          components={[<StyledExternalLink href={EXTERNAL_LINKS.Synthetix.Governance} />]}
        />
      </NewElectionsContainer>
      <LineSpacer />
      <MainContent />
    </>
  );
};

const StyledExternalLink = styled(ExternalLink)`
  color: ${(props) => props.theme.colors.blue};
`;

const NewElectionsContainer = styled.div`
  padding: 24px 0;
`;

export default GovPage;
