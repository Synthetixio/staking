import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Spinner from 'assets/svg/app/loader.svg';
import useActiveTab from '../../hooks/useActiveTab';
import { FlexDivRowCentered } from 'styles/common';
import useProposal from 'queries/gov/useProposal';
import { formatNumber, formatPercent } from 'utils/formatters/number';
import ProgressBar from 'components/ProgressBar';
import { MaxHeightColumn } from 'sections/gov/components/common';

type ResultsProps = {
	hash: string;
};

const Results: React.FC<ResultsProps> = ({ hash }) => {
	const activeTab = useActiveTab();
	// @TODO remove testnet flag
	const proposal = useProposal(activeTab, hash, true);
	if (proposal.isSuccess && proposal.data) {
		const { data } = proposal;
		return (
			<MaxHeightColumn>
				{data.choices.map((choice: string, i: number) => {
					const votes = data.totalBalances[i] !== 0 ? data.totalBalances[i] : 0;
					const totalVotes = data.totalVotesBalances !== 0 ? data.totalVotesBalances : 1;
					return (
						<Row key={i}>
							<Title>
								{choice} - {`${formatNumber(data.totalBalances[i])} ${data.spaceSymbol}`}
							</Title>
							<BarContainer>
								<StyledProgressBar percentage={(votes / totalVotes) * 100} variant="blue-pink" />
								<Value>{formatPercent(votes / totalVotes)}</Value>
							</BarContainer>
						</Row>
					);
				})}
			</MaxHeightColumn>
		);
	} else {
		return <StyledSpinner src={Spinner} />;
	}
};

export default Results;

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;

const Row = styled(FlexDivRowCentered)`
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	padding: 8px;
	margin: 8px 8px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const Value = styled(FlexDivRowCentered)`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	width: 100px;
	margin-left: 8px;
`;
const BarContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 200px;
`;

const StyledProgressBar = styled(ProgressBar)`
	height: 6px;
	width: 100%;
`;
