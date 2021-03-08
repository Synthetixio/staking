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
import { getProfiles } from '../helper';

type ResultsProps = {
	hash: string;
};

const Results: React.FC<ResultsProps> = ({ hash }) => {
	const activeTab = useActiveTab();
	const proposal = useProposal(activeTab, hash);
	const [choices, setChoices] = useState<any>(null);

	useEffect(() => {
		if (proposal && activeTab === SPACE_KEY.COUNCIL) {
			const loadProfiles = async () => {
				const profiles = await getProfiles(proposal?.data?.choices);
				const mappedProfiles = [] as any;
				Object.keys(profiles).forEach((profile) => {
					mappedProfiles.push({
						address: profile,
						ens: profiles[profile].ens ? profiles[profile].ens : null,
						name: profiles[profile].name ? profiles[profile].name : null,
					});
				});
				setChoices(mappedProfiles);
			};
			loadProfiles();
		}
	}, [proposal, activeTab]);

	useEffect(() => {
		if (proposal && activeTab !== SPACE_KEY.COUNCIL) {
			setChoices(proposal?.data?.choices);
		}
	}, [proposal, activeTab]);

	if (proposal.isSuccess && proposal.data && choices) {
		const { data } = proposal;
		return (
			<MaxHeightColumn>
				{choices.map((choice: any, i: number) => {
					const votes = data.totalBalances[i] !== 0 ? data.totalBalances[i] : 0;
					const totalVotes = data.totalVotesBalances !== 0 ? data.totalVotesBalances : 1;
					if (activeTab === SPACE_KEY.COUNCIL) {
						return (
							<Row key={i}>
								<StyledTooltip
									arrow={true}
									placement="bottom"
									content={choice.ens ? choice.ens : choice.name ? choice.name : choice.address}
									hideOnClick={false}
								>
									<Title>
										<p>{choice.ens ? choice.ens : choice.name ? choice.name : choice.address} </p> (
										{`${formatNumber(data.totalBalances[i])} ${data.spaceSymbol}`})
									</Title>
								</StyledTooltip>
								<BarContainer>
									<StyledProgressBar percentage={votes / totalVotes} variant="blue-pink" />
									<Value>{formatPercent(votes / totalVotes)}</Value>
								</BarContainer>
							</Row>
						);
					} else {
						return (
							<Row key={i}>
								<StyledTooltip arrow={true} placement="bottom" content={choice} hideOnClick={false}>
									<Title>
										<p>{choice} </p> ({`${formatNumber(data.totalBalances[i])} ${data.spaceSymbol}`}
										)
									</Title>
								</StyledTooltip>
								<BarContainer>
									<StyledProgressBar percentage={votes / totalVotes} variant="blue-pink" />
									<Value>{formatPercent(votes / totalVotes)}</Value>
								</BarContainer>
							</Row>
						);
					}
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

	display: flex;
	flex-direction: row;
	align-items: center;
	margin-left: 16px;

	p {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		width: 100px;
	}

	width: 250px;
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
