import React, { useMemo } from 'react';
import styled from 'styled-components';
import Spinner from 'assets/svg/app/loader.svg';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { truncateAddress, truncateString } from 'utils/formatters/string';
import { formatNumber } from 'utils/formatters/number';
import { StyledTooltip } from 'sections/gov/components/common';
import { Blockie } from '../common';
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from 'ethers';
import { UseQueryResult } from 'react-query';
import { FixedSizeList as List } from 'react-window';
import { ProposalResults } from '@synthetixio/queries';
import Connector from 'containers/Connector';

type HistoryProps = {
  proposalResults: UseQueryResult<ProposalResults>;
  hash: string;
};

const History: React.FC<HistoryProps> = ({ proposalResults }) => {
  const { t } = useTranslation();
  const { walletAddress, isWalletConnected } = Connector.useContainer();

  const history = useMemo(() => {
    if (proposalResults.isLoading) {
      return (
        <StyledSpinner>
          <Spinner width="38" />
        </StyledSpinner>
      );
    } else if (proposalResults.data) {
      const {
        data: { voteList, spaceSymbol, choices },
      } = proposalResults;
      return (
        <Column>
          <HeaderRow>
            <Title>{t('gov.proposal.history.header.voter')}</Title>
            <Title>{t('gov.proposal.history.header.choice')}</Title>
            <Title>{t('gov.proposal.history.header.weight')}</Title>
          </HeaderRow>
          {voteList.length === 0 ? (
            <Row>
              <EmptyTitle>{t('gov.proposal.history.empty')}</EmptyTitle>
            </Row>
          ) : (
            <List
              height={400}
              width={350}
              itemCount={voteList.length}
              itemSize={65}
              overscanCount={20}
            >
              {({ index, style }) => (
                <Row key={index} style={style}>
                  <LeftSide>
                    <Blockie src={makeBlockie(voteList[index].voter)} />
                    <StyledTooltip
                      arrow={true}
                      placement="bottom"
                      content={
                        isWalletConnected &&
                        ethers.utils.getAddress(voteList[index].voter) ===
                          ethers.utils.getAddress(walletAddress ?? '')
                          ? t('gov.proposal.history.currentUser')
                          : ethers.utils.getAddress(voteList[index].voter)
                      }
                      hideOnClick={false}
                    >
                      <Title>
                        {isWalletConnected &&
                        ethers.utils.getAddress(voteList[index].voter) ===
                          ethers.utils.getAddress(walletAddress ?? '')
                          ? t('gov.proposal.history.currentUser')
                          : truncateAddress(ethers.utils.getAddress(voteList[index].voter))}
                      </Title>
                    </StyledTooltip>
                  </LeftSide>
                  <RightSide>
                    <StyledTooltip
                      arrow={true}
                      placement="bottom"
                      content={choices[voteList[index].choice - 1]}
                      hideOnClick={false}
                    >
                      <Choice>- {truncateString(choices[voteList[index].choice - 1], 13)}</Choice>
                    </StyledTooltip>
                    <StyledTooltip
                      arrow={true}
                      placement="bottom"
                      content={`${formatNumber(voteList[index].scores[1])} WD + ${formatNumber(
                        voteList[index].scores[0]
                      )} WD (delegated)`}
                      hideOnClick={false}
                    >
                      <Value>{`${formatNumber(voteList[index].balance)} ${spaceSymbol}`}</Value>
                    </StyledTooltip>
                  </RightSide>
                </Row>
              )}
            </List>
          )}
        </Column>
      );
    } else {
      return null;
    }
  }, [proposalResults, t, walletAddress, isWalletConnected]);

  return history;
};
export default History;

const Row = styled(FlexDivRowCentered)`
  border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
  justify-content: space-between;
  padding: 0px 16px;
`;

const Column = styled(FlexDivCol)`
  overflow-y: scroll;
`;

const StyledSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 0;
`;

const LeftSide = styled(FlexDivRow)`
  width: 40%;
  justify-content: flex-start;
  align-items: center;
`;

const RightSide = styled(FlexDivRow)`
  width: 60%;
  align-items: center;
`;

const HeaderRow = styled(FlexDivRow)`
  padding-top: 24px;
  justify-content: space-between;
  min-height: 65px;
  padding-right: 16px;
  padding-left: 16px;
`;

const Title = styled.div`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
  margin-left: 8px;
  text-align: left;
`;

const EmptyTitle = styled(Title)`
  margin-bottom: 16px;
`;

const Value = styled(FlexDivRowCentered)`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  margin-left: 8px;
`;
const Choice = styled.div`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 12px;
  margin-left: 12px;
`;
