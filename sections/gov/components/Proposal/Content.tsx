import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';

import { IconButton, Divider } from 'styles/common';

import NavigationBack from 'assets/svg/app/navigation-back.svg';

import {
	InputContainer,
	Container,
	HeaderRow,
	Header,
	StyledCTA,
} from 'sections/gov/components/common';
import { truncateAddress } from 'utils/formatters/string';
import { useTranslation } from 'react-i18next';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { useRecoilValue } from 'recoil';
import { proposalState } from 'store/gov';
import Button from 'components/Button';

type ContentProps = {
	onBack: Function;
};

const Content: React.FC<ContentProps> = ({ onBack }) => {
	const { t } = useTranslation();

	const [voteMutate, result] = useSignMessage();
	const activeTab = useActiveTab();
	const proposal = useRecoilValue(proposalState);
	const [selected, setSelected] = useState<number | null>(null);

	const handleVote = async (hash?: string | null) => {
		try {
			if (hash && selected) {
				voteMutate({
					spaceKey: activeTab,
					type: SignatureType.VOTE,
					payload: { proposal: hash, choice: selected + 1, metadata: {} },
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

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

	// @TODO add withdraw vote logic
	const returnButtonStates = useMemo(() => {
		if (result.isLoading) {
			return (
				<StyledCTA disabled variant="primary">
					{t('gov.proposal.action.vote.loading')}
				</StyledCTA>
			);
		} else if (result.isSuccess) {
			return (
				<StyledCTA
					onClick={() => {
						onBack();
					}}
					variant="primary"
				>
					{t('gov.proposal.action.vote.success')}
				</StyledCTA>
			);
		} else if (result.isError) {
			return (
				<StyledCTA onClick={() => handleVote(proposal?.authorIpfsHash)} variant="primary">
					{t('gov.proposal.action.vote.error')}
				</StyledCTA>
			);
		} else
			return (
				<StyledCTA onClick={() => handleVote(proposal?.authorIpfsHash)} variant="primary">
					{t('gov.proposal.action.vote.idle')}
				</StyledCTA>
			);
	}, [result, t, handleVote, onBack, proposal]);

	return (
		<Container>
			<InputContainer>
				<HeaderRow>
					<IconButton onClick={() => onBack(null)}>
						<Svg src={NavigationBack} />
					</IconButton>
					<Header>#{truncateAddress(proposal?.authorIpfsHash ?? '')}</Header>
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
						<Option selected={selected === i} onClick={() => setSelected(i)} variant="text" key={i}>
							{choice}
						</Option>
					))}
				</OptionsContainer>
			</InputContainer>
			<ActionContainer>{returnButtonStates}</ActionContainer>
		</Container>
	);
};
export default Content;

const Status = styled.p<{ active: boolean }>`
	color: ${(props) => (props.active ? props.theme.colors.green : props.theme.colors.gray)};
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
`;

const ProposalContainer = styled.div``;

const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
	text-align: center;
`;

const Description = styled.div`
	max-height: 300px;
	overflow: scroll;
	font-size: 14px;
	text-align: center;
	font-family: ${(props) => props.theme.fonts.regular};
	margin: 16px 8px;

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
	max-height: 200px;
	overflow: scroll;
	width: 100%;
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 8px;
	row-gap: 8px;
`;

const Option = styled(Button)<{ selected: boolean }>`
	background-color: ${(props) =>
		props.selected ? props.theme.colors.mediumBlue : props.theme.colors.navy};
	color: ${(props) => (props.selected ? props.theme.colors.blue : props.theme.colors.white)};
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
