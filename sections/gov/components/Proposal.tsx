import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';

import { FlexDivRowCentered, IconButton } from 'styles/common';

import NavigationBack from 'assets/svg/app/navigation-back.svg';

import { InputContainer, Divider } from 'sections/gov/components/common';
import { Proposal as ProposalItem } from 'queries/gov/types';
import { truncateAddress } from 'utils/formatters/string';
import { useTranslation } from 'react-i18next';
import Button from 'components/Button';

type ProposalProps = {
	onBack: Function;
	proposal: ProposalItem | null;
};

const Proposal: React.FC<ProposalProps> = ({ onBack, proposal }) => {
	const { t } = useTranslation();

	// Left side panel
	// Get all proposals and filter only the prooposal that matches the hash from the array
	// Retrieve options (description, end time, choices)

	// Right side panel
	// Get the voting results and make the UI

	const expired = (timestamp?: number) => {
		if (!timestamp) return;
		if (Date.now() / 1000 > timestamp) {
			return true;
		} else {
			return false;
		}
	};

	const getRawMarkup = (value?: string | null) => {
		const remarkable = new Remarkable({
			html: false,
			breaks: true,
			typographer: false,
		})
			.use(linkify)
			.use(externalLink);

		if (!value) return { __html: '' };

		return { __html: remarkable.render(value) };
	};

	return (
		<>
			<InputContainer>
				<HeaderRow>
					<IconButton onClick={() => onBack(null)}>
						<Svg src={NavigationBack} />
					</IconButton>
					<Hash>#{truncateAddress(proposal?.authorIpfsHash ?? '')}</Hash>
					<Status active={!expired(proposal?.msg.payload.end)}>
						{expired(proposal?.msg.payload.end)
							? t('gov.proposal.status.closed')
							: t('gov.proposal.status.open')}
					</Status>
				</HeaderRow>
				<ProposalContainer>
					<Title>{proposal?.msg.payload.name}</Title>
					<Description dangerouslySetInnerHTML={getRawMarkup(proposal?.msg.payload.body)} />
				</ProposalContainer>
				<Divider />
				<OptionsContainer>
					{proposal?.msg.payload.choices.map((choice, i) => (
						<Option variant="text" key={i}>
							{choice}
						</Option>
					))}
				</OptionsContainer>
				<ActionContainer></ActionContainer>
			</InputContainer>
		</>
	);
};
export default Proposal;

const HeaderRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

const Hash = styled.p`
	color: ${(props) => props.theme.colors.gray};
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 14px;
`;

const Status = styled.p<{ active: boolean }>`
	color: ${(props) => (props.active ? props.theme.colors.green : props.theme.colors.gray)};
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 14px;
`;

const ProposalContainer = styled.div``;

const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
	text-align: center;
`;

const Description = styled.div`
	height: 300px;
	overflow: scroll;
	font-size: 14px;
	text-align: center;
	font-family: ${(props) => props.theme.fonts.regular};
	margin: 0px 8px;

	h1 {
		font-size: 14px;
	}

	h2 {
		font-size: 14px;
	}

	h3 {
		font-size: 14px;
	}

	h4 {
		font-size: 14px;
	}

	h5 {
		font-size: 14px;
	}

	h6 {
		font-size: 14px;
	}

	a {
		color: ${(props) => props.theme.colors.blue};
		font-family: ${(props) => props.theme.fonts.interBold};
		text-decoration: none;
		font-size: 14px;
	}
`;

const OptionsContainer = styled.div`
	height: 200px;
	overflow: scroll;
	width: 100%;
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 8px;
	row-gap: 8px;
	/* grid-template-columns: 40px 40px 40px; */
`;

const Option = styled(Button)`
	background-color: ${(props) => props.theme.colors.navy};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.interBold};
	text-transform: uppercase;
	text-align: center;

	:hover {
		background-color: ${(props) => props.theme.colors.mediumBlue};
		transition: background-color 0.25s;
	}
`;

const ActionContainer = styled.div``;
