import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Spinner from 'assets/svg/app/loader.svg';
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'styles/common';
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
import { ProposalResults } from 'queries/gov/types';

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
			return (
				<StyledSpinner>
					<Svg src={Spinner} />
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
					<List
						height={400}
						width={350}
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
				</Column>
			);
		} else {
			return null;
		}
	}, [proposalResults, t, getAddress, walletAddress]);

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
