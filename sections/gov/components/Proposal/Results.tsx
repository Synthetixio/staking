import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Spinner from 'assets/svg/app/loader.svg';
import useActiveTab from '../../hooks/useActiveTab';
import { FlexDivRowCentered } from 'styles/common';
import useProposal from 'queries/gov/useProposal';
import { formatNumber, formatPercent } from 'utils/formatters/number';
import ProgressBar from 'components/ProgressBar';
import { MaxHeightColumn, StyledTooltip } from 'sections/gov/components/common';
import { SPACE_KEY } from 'constants/snapshot';
import CouncilNominations from 'constants/nominations.json';
import { useRecoilValue } from 'recoil';
import { councilElectionCountState, numOfCouncilSeatsState } from 'store/gov';

type ResultsProps = {
	hash: string;
};

const Results: React.FC<ResultsProps> = ({ hash }) => {
	const activeTab = useActiveTab();
	const proposal = useProposal(activeTab, hash);
	const [choices, setChoices] = useState<any>(null);
	const electionCount = useRecoilValue(councilElectionCountState);
	const numOfCouncilSeats = useRecoilValue(numOfCouncilSeatsState);

	useEffect(() => {
		if (proposal && activeTab === SPACE_KEY.COUNCIL) {
			const loadDiscordNames = async () => {
				const currentElectionMembers = CouncilNominations as any;
				const mappedProfiles = [] as any;

				currentElectionMembers[electionCount].forEach((member: any) => {
					mappedProfiles.push({
						address: member.address,
						name: member.discord,
					});
				});
				setChoices(mappedProfiles);
			};
			loadDiscordNames();
		}
	}, [proposal, activeTab, electionCount]);

	useEffect(() => {
		if (proposal && activeTab !== SPACE_KEY.COUNCIL) {
			setChoices(proposal?.data?.choices);
		}
	}, [proposal, activeTab]);

	if (proposal.isSuccess && proposal.data && choices) {
		const { data } = proposal;

		const totalVotes = data.totalVotesBalances !== 0 ? data.totalVotesBalances : 1;

		const mappedResults = data.totalBalances
			.map((balance, key) => {
				if (activeTab === SPACE_KEY.COUNCIL) {
					return {
						label: choices[key].name ? choices[key].name : choices[key].address,
						balance: balance,
					};
				} else {
					return {
						label: choices[key],
						balance: balance,
					};
				}
			})
			.sort((a: any, b: any) => b.balance - a.balance);

		return (
			<MaxHeightColumn>
				{mappedResults.map((choice: any, i: number) => {
					return (
						<Row key={i} highlight={activeTab === SPACE_KEY.COUNCIL && i < numOfCouncilSeats}>
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
								<StyledProgressBar percentage={choice.balance / totalVotes} variant="blue-pink" />
								<Value>{formatPercent(choice.balance / totalVotes)}</Value>
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

const Row = styled(FlexDivRowCentered)<{ highlight: boolean }>`
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	padding: 8px;
	margin: 8px 8px;
	background: ${(props) => props.highlight && props.theme.colors.mediumBlue};
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};

	display: flex;
	flex-direction: row;
	align-items: center;
	margin-left: 16px;

	width: 250px;

	padding: 16px 0px;
`;

const Label = styled.span`
	margin-right: 4px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	width: 100px;
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
