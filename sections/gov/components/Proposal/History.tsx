import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Spinner from 'assets/svg/app/loader.svg';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { ProposalResults } from 'queries/gov/useProposal';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { useTranslation } from 'react-i18next';
import { truncateAddress, truncateString } from 'utils/formatters/string';
import { formatNumber } from 'utils/formatters/number';
import { StyledTooltip } from 'sections/gov/components/common';
import { Blockie } from '../common';
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from 'ethers';
import { QueryResult } from 'react-query';
import { List } from 'react-virtualized';

type HistoryProps = {
	proposalResults: QueryResult<ProposalResults, unknown>;
	hash: string;
};

const History: React.FC<HistoryProps> = ({ proposalResults }) => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const { getAddress } = ethers.utils;

	const history = useMemo(() => {
		if (proposalResults.isLoading) {
			return <StyledSpinner src={Spinner} />;
		} else if (proposalResults.data) {
			const {
				data: { voteList, spaceSymbol, choices },
			} = proposalResults;
			return (
				<>
					<HeaderRow>
						<Title>{t('gov.proposal.history.total', { totalVotes: voteList.length })}</Title>
					</HeaderRow>
					<HeaderRow>
						<Title>{t('gov.proposal.history.header.voter')}</Title>
						<Title>{t('gov.proposal.history.header.choice')}</Title>
						<Title>{t('gov.proposal.history.header.weight')}</Title>
					</HeaderRow>
					<List
						height={400}
						width={400}
						rowCount={voteList.length}
						rowHeight={65}
						overscanRowCount={20}
						noRowsRenderer={() => {
							return (
								<Row>
									<Title>{t('gov.proposal.history.empty')}</Title>
								</Row>
							);
						}}
						rowRenderer={({ key, index, style }) => {
							return (
								<Row key={key} style={style}>
									<LeftSide>
										<Blockie src={makeBlockie(voteList[index].voter)} />
										<StyledTooltip
											arrow={true}
											placement="bottom"
											content={
												getAddress(voteList[index].voter) === getAddress(walletAddress ?? '')
													? t('gov.proposal.history.currentUser')
													: voteList[index].profile.ens
													? voteList[index].profile.ens
													: getAddress(voteList[index].voter)
											}
											hideOnClick={false}
										>
											<Title>
												{getAddress(voteList[index].voter) === getAddress(walletAddress ?? '')
													? t('gov.proposal.history.currentUser')
													: voteList[index].profile.ens
													? truncateString(voteList[index].profile.ens, 13)
													: truncateAddress(getAddress(voteList[index].voter))}
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
											content={`${formatNumber(voteList[index].scores[0])} WD + ${formatNumber(
												voteList[index].scores[1]
											)} WD (delegated)`}
											hideOnClick={false}
										>
											<Value>{`${formatNumber(voteList[index].balance)} ${spaceSymbol}`}</Value>
										</StyledTooltip>
									</RightSide>
								</Row>
							);
						}}
					/>
				</>
			);
		} else {
			return null;
		}
	}, [proposalResults, t, getAddress, walletAddress]);

	return history;
};
export default History;

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;

const LeftSide = styled(FlexDivRow)`
	width: 40%;
	justify-content: flex-start;
	align-items: center;
	padding: 8px;
	margin: 8px 8px;
`;

const RightSide = styled(FlexDivRow)`
	width: 60%;
	align-items: center;
	padding: 8px;
	margin: 8px 8px;
`;

const Row = styled(FlexDivRowCentered)`
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
`;

const HeaderRow = styled(FlexDivRow)`
	padding: 8px;
	margin: 8px 8px;
	justify-content: space-between;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	margin-left: 8px;
	text-align: left;
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
	margin-left: 8px;
`;
