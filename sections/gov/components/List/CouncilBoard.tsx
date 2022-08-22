import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import makeBlockie from 'ethereum-blockies-base64';

import { ExternalLink, FlexDivRowCentered } from 'styles/common';

import Spinner from 'assets/svg/app/loader.svg';

import Etherscan from 'containers/BlockExplorer';
import { truncateAddress } from 'utils/formatters/string';

import Link from 'assets/svg/app/link.svg';
import { Blockie, StyledTooltip } from '../common';
import { Card } from 'sections/gov/components/common';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from '../../../../containers/Connector';

const CouncilBoard: React.FC = () => {
  const { t } = useTranslation();
  const { L2DefaultProvider } = Connector.useContainer();
  const { blockExplorerInstance } = Etherscan.useContainer();
  const theme = useTheme();
  const { useGetSpartanCouncil } = useSynthetixQueries();
  const councilMembersQuery = useGetSpartanCouncil(
    process.env.NEXT_PUBLIC_BOARDROOM_KEY ?? '',
    L2DefaultProvider
  );
  const councilMembers = councilMembersQuery.data;

  return (
    <StyledCard>
      <img width={'100%'} src="/gifs/SC-NFT.gif" alt="sc-nft" />
      <Title>{t('gov.council.title')}</Title>

      {councilMembers ? (
        councilMembers.length > 0 ? (
          councilMembers.map((member, i) => {
            const displayName = member.username ? member.username : member.address;
            const isAddress = Boolean(member.ens);
            return (
              <MemberRow key={i}>
                <FlexDivRowCentered>
                  <Blockie src={makeBlockie(member.address)} />
                  <StyledTooltip
                    key={i}
                    arrow={true}
                    placement="bottom"
                    content={member.ens ? member.ens : member.address}
                    hideOnClick={false}
                  >
                    <Address>{isAddress ? truncateAddress(displayName) : displayName}</Address>
                  </StyledTooltip>
                </FlexDivRowCentered>
                <ExternalLink
                  href={
                    blockExplorerInstance
                      ? blockExplorerInstance.addressLink(member.address)
                      : undefined
                  }
                >
                  <Link width="16" style={{ color: theme.colors.blue }} />
                </ExternalLink>
              </MemberRow>
            );
          })
        ) : (
          <MemberRow>
            <Address>{t('gov.council.empty')}</Address>
          </MemberRow>
        )
      ) : (
        <StyledSpinner>
          <Spinner width="38" />
        </StyledSpinner>
      )}
    </StyledCard>
  );
};
export default CouncilBoard;

const StyledCard = styled(Card)`
  padding: 0px;
`;

const Title = styled.p`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 14px;
  text-transform: capitalize;
  text-align: center;
  padding: 4px 8px;
`;

const MemberRow = styled(FlexDivRowCentered)`
  border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
  justify-content: space-between;
  margin: 8px 0px;
  padding: 4px 16px;
`;

const Address = styled.p`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
`;

const StyledSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 0;
`;
