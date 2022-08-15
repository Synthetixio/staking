import React from 'react';
import styled from 'styled-components';
import Spinner from 'assets/svg/app/loader.svg';
import { FlexDivRowCentered } from 'styles/common';
import { formatNumber, formatPercent } from 'utils/formatters/number';
import ProgressBar from 'components/ProgressBar';
import { MaxHeightColumn, StyledTooltip } from 'sections/gov/components/common';
import { UseQueryResult } from 'react-query';
import { ProposalResults } from '@synthetixio/queries';

type ResultsProps = {
  proposalResults: UseQueryResult<ProposalResults, unknown>;
};

const Results: React.FC<ResultsProps> = ({ proposalResults }) => {
  const choices = proposalResults?.data?.choices;

  if (proposalResults.isSuccess && proposalResults.data && choices && choices.length > 0) {
    const { data } = proposalResults;

    const totalVotes = data.totalVotesBalances !== 0 ? data.totalVotesBalances : 1;

    const mappedResults = data.totalBalances
      .map((balance, key) => {
        return {
          label: choices[key],
          balance: balance,
        };
      })
      .sort((a, b) => b.balance - a.balance);

    return (
      <MaxHeightColumn>
        {mappedResults.map((choice) => {
          return (
            <Row key={choice.label} highlight={false}>
              <StyledTooltip
                arrow={true}
                placement="bottom"
                content={choice.label}
                hideOnClick={false}
              >
                <Title>
                  <Label>{choice.label} </Label> (
                  {`${formatNumber(choice.balance)} ${data.spaceSymbol}`})
                </Title>
              </StyledTooltip>
              <BarContainer>
                <StyledProgressBar
                  percentage={choice.balance / totalVotes ?? 0}
                  variant="blue-pink"
                />
                <Value>{formatPercent(choice.balance / totalVotes)}</Value>
              </BarContainer>
            </Row>
          );
        })}
      </MaxHeightColumn>
    );
  } else {
    return (
      <StyledSpinner>
        <Spinner width="38" />
      </StyledSpinner>
    );
  }
};

export default Results;

const StyledSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px 0;
`;

const Row = styled(FlexDivRowCentered)<{ highlight: boolean }>`
  border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
  justify-content: space-between;
  background: ${(props) => props.highlight && props.theme.colors.mediumBlue};
  width: 350px;
  min-height: 65px;
  padding: 0px 8px;
  margin: 4px 0px;
`;

const Title = styled.div`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};

  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 16px;

  width: 60%;
`;

const Label = styled.span`
  margin-right: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 75px;
`;

const Value = styled(FlexDivRowCentered)`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  margin-left: 8px;
`;
const BarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40%;
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 6px;
  width: 100%;
`;
