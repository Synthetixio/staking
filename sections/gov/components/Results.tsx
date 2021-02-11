import React from 'react';
import styled from 'styled-components';
import useVotes from 'queries/gov/useProposal';
import { SPACE_KEY } from 'constants/snapshot';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import Spinner from 'assets/svg/app/loader.svg';
import useActiveTab from '../hooks/useActiveTab';
import { FlexDivRowCentered } from 'styles/common';
import { proposalState } from 'store/gov';
import useSnapshotSpace from 'queries/gov/useSnapshotSpace';
import useProposal from 'queries/gov/useProposal';

type ResultsProps = {
	hash: string;
};

const Results: React.FC<ResultsProps> = ({ hash }) => {
	const activeTab = useActiveTab();
	// const proposal = useRecoilValue(proposalState);
	const proposal = useProposal(activeTab, hash, true);

	console.log(proposal);
	// const space = useSnapshotSpace(activeTab, true);

	// if (votes.isSuccess && votes.data && space && space.data && proposal) {
	// 	/* Get results */
	// 	const results = {
	// 		totalVotes: proposal.msg.payload.choices.map(
	// 			(choice, i) => votes?.data.filter((vote: any) => vote.msg.payload.choice === i + 1).length
	// 		),
	// 		totalBalances: proposal.msg.payload.choices.map((choice, i) =>
	// 			votes?.data
	// 				.filter((vote: any) => vote.msg.payload.choice === i + 1)
	// 				.reduce((a, b: any) => a + b.balance, 0)
	// 		),
	// 		// totalScores: proposal.msg.payload.choices.map((choice, i) =>
	// 		// 	space?.data.strategies.map((strategy, sI) =>
	// 		// 		votes?.data
	// 		// 			.filter((vote: any) => vote.msg.payload.choice === i + 1)
	// 		// 			.reduce((a, b: any) => a + b.scores[sI], 0)
	// 		// 	)
	// 		// ),
	// 		// totalVotesBalances: Object.values(votes).reduce((a, b: any) => a + b.balance, 0),
	// 	};

	// 	console.log(results);

	// 	// const mappedResults = proposal.msg.payload.choices
	// 	// 	.map((choice, i) => ({ i, choice }))
	// 	// 	.sort((a, b) => results.totalBalances[b.i] - results.totalBalances[a.i]);

	// 	return (
	// 		<>
	// 			{/* {mappedResults.map((choice, i) => (
	// 				<Row key={i}>
	// 					{console.log(choice)}
	// 					<Title>{choice}</Title>
	// 				</Row>
	// 			))} */}
	// 		</>
	// 	);
	// } else {
	return <StyledSpinner src={Spinner} />;
	// }
};

export default Results;

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
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
