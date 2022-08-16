import React from 'react';
import styled, { useTheme } from 'styled-components';
import makeBlockie from 'ethereum-blockies-base64';

import Etherscan from 'containers/BlockExplorer';

import { FlexDivRowCentered, ExternalLink } from 'styles/common';
import { truncateAddress } from 'utils/formatters/string';
import { formatTxTimestamp } from 'utils/formatters/date';
import Link from 'assets/svg/app/link.svg';
import { Blockie } from '../common';
import { Card } from 'sections/gov/components/common';
import { Proposal } from '@synthetixio/queries';
import { useTranslation } from 'react-i18next';
import { SPACE_KEY } from 'constants/snapshot';

type DetailsProps = {
  proposal?: Proposal;
};

const Details: React.FC<DetailsProps> = ({ proposal }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { blockExplorerInstance } = Etherscan.useContainer();

  return (
    <InfoCard>
      <Row>
        <Title>{t('gov.proposal.info.author')}</Title>
        {proposal && (
          <Value>
            <Blockie src={makeBlockie(proposal.author)} />
            {truncateAddress(proposal.author)}{' '}
            <ExternalLink
              href={
                blockExplorerInstance
                  ? blockExplorerInstance.addressLink(proposal.author)
                  : undefined
              }
            >
              <Link width="16" style={{ marginLeft: 4, color: theme.colors.blue }} />
            </ExternalLink>
          </Value>
        )}
      </Row>
      <Row>
        <Title>{t('gov.proposal.info.time')}</Title>
        {proposal && (
          <Value>
            {formatTxTimestamp(proposal.start * 1000)} - {formatTxTimestamp(proposal.end * 1000)}
          </Value>
        )}
      </Row>
      <Row>
        <Title>{t('gov.proposal.info.proposalLink')}</Title>
        {proposal && (
          <Value>
            {truncateAddress(proposal.id)}
            <ExternalLink
              href={`https://snapshot.org/#/${SPACE_KEY.PROPOSAL}/proposal/${proposal.id}`}
            >
              <Link width="16" style={{ marginLeft: 4, color: theme.colors.blue }} />
            </ExternalLink>
          </Value>
        )}
      </Row>
      <Row>
        <Title>{t('gov.proposal.info.snapshot')}</Title>
        {proposal && (
          <Value>
            {proposal.snapshot}
            <ExternalLink
              href={
                blockExplorerInstance
                  ? blockExplorerInstance.blockLink(proposal.snapshot)
                  : undefined
              }
            >
              <Link width="16" style={{ marginLeft: 4, color: theme.colors.blue }} />
            </ExternalLink>
          </Value>
        )}
      </Row>
    </InfoCard>
  );
};
export default Details;
const InfoCard = styled(Card)`
  background-color: ${(props) => props.theme.colors.navy};
  margin-bottom: 16px;
  padding: 16px;
  width: 100%;
`;

const Row = styled(FlexDivRowCentered)`
  margin-bottom: 8px;
  border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
  justify-content: space-between;
  padding: 8px;
`;

const Title = styled.div`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.gray};
`;

const Value = styled(FlexDivRowCentered)`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
`;
