import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';

import {
	IconButton,
	Divider,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemText,
	ModalItemTitle,
} from 'styles/common';

import NavigationBack from 'assets/svg/app/navigation-back.svg';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';

import {
	InputContainer,
	Container,
	HeaderRow,
	Header,
	StyledCTA,
	StyledTooltip,
	GreyHeader,
	DismissButton,
	ButtonSpacer,
	WhiteSubheader,
} from 'sections/gov/components/common';

import { truncateAddress } from 'utils/formatters/string';
import { useTranslation } from 'react-i18next';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { useRecoilValue } from 'recoil';
import { councilElectionCountState, proposalState } from 'store/gov';
import Button from 'components/Button';

import { Transaction } from 'constants/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import TxState from 'sections/gov/components/TxState';
import { expired, pending, shuffleArray } from '../helper';
import { SPACE_KEY } from 'constants/snapshot';
import CouncilNominations from 'constants/nominations.json';

type ContentProps = {
	onBack: Function;
};

const Content: React.FC<ContentProps> = ({ onBack }) => {
	const { t } = useTranslation();

	const [voteMutate] = useSignMessage();
	const activeTab = useActiveTab();
	const [selected, setSelected] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [signModalOpen, setSignModalOpen] = useState<boolean>(false);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);

	const proposal = useRecoilValue(proposalState);

	const [choices, setChoices] = useState<any>(null);

	const electionCount = useRecoilValue(councilElectionCountState);

	useEffect(() => {
		if (proposal && proposal.msg.payload.choices && activeTab === SPACE_KEY.COUNCIL) {
			const loadDiscordNames = async () => {
				const currentElectionMembers = CouncilNominations as any;
				const mappedProfiles = [] as any;

				currentElectionMembers[electionCount].forEach((member: any, i: number) => {
					mappedProfiles.push({
						address: member.address,
						name: member.discord,
						key: i,
					});
				});
				setChoices(shuffleArray(mappedProfiles));
			};
			loadDiscordNames();
		}
	}, [proposal, activeTab, electionCount]);

	useEffect(() => {
		if (proposal && activeTab !== SPACE_KEY.COUNCIL) {
			setChoices(proposal?.msg.payload.choices);
		}
	}, [proposal, activeTab]);

	const handleVote = async (hash?: string | null) => {
		if (hash && selected !== null) {
			setSignModalOpen(true);
			setTransactionState(Transaction.WAITING);
			voteMutate({
				spaceKey: activeTab,
				type: SignatureType.VOTE,
				payload: { proposal: hash, choice: selected + 1, metadata: {} },
			})
				.then((response) => {
					setTransactionState(Transaction.SUCCESS);
					setSignModalOpen(false);
				})
				.catch((error) => {
					setTransactionState(Transaction.PRESUBMIT);
					setError(error);
				});
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

	const returnInnerContent = () => {
		if (transactionState === Transaction.WAITING) {
			return (
				<TxState
					title={t('gov.actions.vote.waiting')}
					content={
						<FlexDivColCentered>
							<Svg src={PendingConfirmation} />
							<GreyHeader>{t('gov.actions.vote.signing')}</GreyHeader>
							<WhiteSubheader>
								{t('gov.actions.vote.hash', {
									hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
								})}
							</WhiteSubheader>
						</FlexDivColCentered>
					}
				/>
			);
		}

		if (transactionState === Transaction.SUCCESS) {
			return (
				<TxState
					title={t('gov.actions.vote.success')}
					content={
						<FlexDivColCentered>
							<Svg src={Success} />
							<GreyHeader>{t('gov.actions.vote.signed')}</GreyHeader>
							<WhiteSubheader>
								{t('gov.actions.vote.hash', {
									hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
								})}
							</WhiteSubheader>
							<Divider />
							<ButtonSpacer>
								<DismissButton
									variant="secondary"
									onClick={() => {
										setTransactionState(Transaction.PRESUBMIT);
										onBack();
									}}
								>
									{t('earn.actions.tx.dismiss')}
								</DismissButton>
							</ButtonSpacer>
						</FlexDivColCentered>
					}
				/>
			);
		}

		return (
			<Container>
				<InputContainer>
					<HeaderRow>
						<IconButton onClick={() => onBack(null)}>
							<Svg src={NavigationBack} />
						</IconButton>
						<Header>#{truncateAddress(proposal?.authorIpfsHash ?? '')}</Header>
						<Status
							closed={expired(proposal?.msg.payload.end)}
							pending={pending(proposal?.msg.payload.start)}
						>
							{expired(proposal?.msg.payload.end)
								? t('gov.proposal.status.closed')
								: pending(proposal?.msg.payload.start)
								? t('gov.proposal.status.pending')
								: t('gov.proposal.status.open')}
						</Status>
					</HeaderRow>
					<ProposalContainer>
						<Title>{proposal?.msg.payload.name}</Title>
						<Description dangerouslySetInnerHTML={getRawMarkup(proposal?.msg.payload.body)} />
					</ProposalContainer>
					<Divider />
					{!expired(proposal?.msg.payload.end) && !pending(proposal?.msg.payload.start) && choices && (
						<OptionsContainer>
							{activeTab === SPACE_KEY.COUNCIL ? (
								<>
									{choices.map((choice: any, i: any) => {
										return (
											<StyledTooltip
												key={i}
												arrow={true}
												placement="bottom"
												content={choice.name ? choice.name : choice.address}
												hideOnClick={false}
											>
												<Option
													selected={selected === choice.key}
													onClick={() => setSelected(choice.key)}
													variant="text"
												>
													<p>{choice.name ? choice.name : choice.address}</p>
												</Option>
											</StyledTooltip>
										);
									})}
								</>
							) : (
								<>
									{choices.map((choice: any, i: any) => {
										return (
											<StyledTooltip
												key={i}
												arrow={true}
												placement="bottom"
												content={choice}
												hideOnClick={false}
											>
												<Option
													selected={selected === i}
													onClick={() => setSelected(i)}
													variant="text"
												>
													<p>{choice}</p>
												</Option>
											</StyledTooltip>
										);
									})}
								</>
							)}
						</OptionsContainer>
					)}
				</InputContainer>
				{!expired(proposal?.msg.payload.end) && !pending(proposal?.msg.payload.start) && (
					<StyledCTA onClick={() => handleVote(proposal?.authorIpfsHash)} variant="primary">
						{t('gov.proposal.action.vote')}
					</StyledCTA>
				)}
			</Container>
		);
	};

	return (
		<>
			{returnInnerContent()}
			{signModalOpen && (
				<TxConfirmationModal
					isSignature={true}
					onDismiss={() => setSignModalOpen(false)}
					txError={error}
					attemptRetry={handleVote}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-signature.vote.title')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-signature.vote.hash', {
										hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
									})}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};
export default Content;

const Status = styled.p<{ closed: boolean; pending: boolean }>`
	color: ${(props) =>
		props.closed
			? props.theme.colors.gray
			: props.pending
			? props.theme.colors.yellow
			: props.theme.colors.green};
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
`;

const ProposalContainer = styled(FlexDivColCentered)`
	min-height: 400px;
`;

const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
	text-align: center;
`;

const Description = styled.div`
	max-height: 300px;
	overflow-y: auto;
	font-size: 14px;
	text-align: center;
	font-family: ${(props) => props.theme.fonts.regular};
	margin: 16px 8px;

	width: 500px;

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
	overflow-y: auto;
	width: 500px;
	display: grid;
	grid-template-columns: auto auto;
	column-gap: 8px;
	row-gap: 8px;
	padding-top: 16px;
`;

const Option = styled(Button)<{ selected: boolean }>`
	background-color: ${(props) =>
		props.selected ? props.theme.colors.mediumBlue : props.theme.colors.navy};
	color: ${(props) => (props.selected ? props.theme.colors.blue : props.theme.colors.white)};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.interBold};
	text-transform: uppercase;
	text-align: center;
	align-items: center;

	width: 235px;

	p {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		padding: 0px 16px;
		margin: 0;
	}

	:hover {
		background-color: ${(props) => props.theme.colors.mediumBlue};
		transition: background-color 0.25s;
	}
`;
