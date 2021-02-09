import React from 'react';
import styled from 'styled-components';
import useVotes from 'queries/gov/useVotes';
import { SPACE_KEY } from 'constants/snapshot';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import Spinner from 'assets/svg/app/loader.svg';
import useActiveTab from '../hooks/useActiveTab';
import { FlexDivRowCentered } from 'styles/common';
import { proposalState } from 'store/gov';

type ResultsProps = {
	hash: string;
};

const Results: React.FC<ResultsProps> = ({ hash }) => {
	const activeTab = useActiveTab();
	const vote = useVotes(activeTab, hash, true);
	const proposal = useRecoilValue(proposalState);

	if (vote.isSuccess && vote.data && proposal) {
		const mappedVotes = proposal.msg.payload.choices;

		return (
			<>
				{mappedVotes.map((choice, i) => (
					<Row key={i}>
						<Title>{choice}</Title>
					</Row>
				))}
			</>
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
