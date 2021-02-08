import React, { useState } from 'react';
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
import { MSG, SPACE_KEY } from 'constants/snapshot';
import { version } from '@snapshot-labs/snapshot.js/package.json';
import snapshot from '@snapshot-labs/snapshot.js';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import axios from 'axios';

type ProposalProps = {
	onBack: Function;
	proposal: ProposalItem | null;
	spaceKey: SPACE_KEY;
};

const Proposal: React.FC<ProposalProps> = ({ onBack, proposal, spaceKey }) => {
	const { signer } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);
	const [selected, setSelected] = useState<number | null>(null);
	const { t } = useTranslation();

	// Left side panel
	// Get all proposals and filter only the prooposal that matches the hash from the array
	// Retrieve options (description, end time, choices)

	// Right side panel
	// Get the voting results and make the UI

	const saveVote = async (msg: any) => {
		const url = `${MSG(true)}`;
		return await axios.post(url, msg, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});
	};

	const handleVote = async (hash?: string | null) => {
		try {
			// @TODO: Rely on package.json
			const version = '0.1.3';
			if (hash && selected !== null) {
				const msg: any = {
					address: walletAddress,
					msg: JSON.stringify({
						version,
						timestamp: (Date.now() / 1e3).toFixed(),
						space: spaceKey,
						type: 'vote',
						payload: {
							proposal: hash,
							choice: selected + 1,
							metadata: {},
						},
					}),
				};
				msg.sig = await signer?.signMessage(msg.msg);
				const result = await saveVote(msg);
				console.log(result.data);
			}
		} catch (e) {
			console.log(e);
			// const errorMessage =
			// 	e && e.error_description ? `Oops, ${e.error_description}` : 'Oops, something went wrong!';
			// console.log(errorMessage);
			return;
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
						<Option selected={selected === i} onClick={() => setSelected(i)} variant="text" key={i}>
							{choice}
						</Option>
					))}
				</OptionsContainer>
				<ActionContainer>
					<StyledCTA onClick={() => handleVote(proposal?.authorIpfsHash)} variant="primary">
						{t('gov.proposal.action.vote')}
					</StyledCTA>
				</ActionContainer>
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
	height: 200px;
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

const ActionContainer = styled.div`
	width: 100%;
`;

const StyledCTA = styled(Button)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	width: 100%;
	margin: 4px 0px;
`;
