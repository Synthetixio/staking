import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';

import NavigationBack from 'assets/svg/app/navigation-back.svg';
import Success from 'assets/svg/app/success.svg';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';

import Input, { inputCSS } from 'components/Input/Input';
import { Divider, FlexDivColCentered, IconButton, ExternalLink } from 'styles/common';
import media from 'styles/media';
import {
	InputContainer,
	Container,
	HeaderRow,
	Header,
	StyledCTA,
	WhiteSubheader,
	ButtonSpacer,
	DismissButton,
	GreyHeader,
	GreyText,
	LinkText,
	VerifyButton,
} from '../common';
import { useTranslation } from 'react-i18next';
import { Transaction } from 'constants/network';
import { truncateAddress } from 'utils/formatters/string';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import TxState from 'sections/gov/components/TxState';
import Etherscan from 'containers/BlockExplorer';

type QuestionProps = {
	onBack: Function;
	setBody: Function;
	setName: Function;
	body: string;
	name: string;
	handleCreate: () => void;
	result: any;
	validSubmission: boolean;
	signTransactionState: Transaction;
	setSignTransactionState: Function;
	txTransactionState: 'pending' | 'confirmed' | string;
	hash: string | null;
	txHash: string | null;
};

const Question: React.FC<QuestionProps> = ({
	onBack,
	setBody,
	setName,
	body,
	name,
	handleCreate,
	validSubmission,
	signTransactionState,
	setSignTransactionState,
	txTransactionState,
	txHash,
	hash,
}) => {
	const { t } = useTranslation();
	const activeTab = useActiveTab();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const link =
		blockExplorerInstance != null && txHash != null
			? blockExplorerInstance.txLink(txHash)
			: undefined;

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

	const returnButtonStates = useMemo(() => {
		if (!validSubmission) {
			return (
				<StyledCTA disabled={true} variant="primary">
					{t('gov.create.action.invalid')}
				</StyledCTA>
			);
		} else
			return (
				<StyledCTA onClick={() => handleCreate()} variant="primary">
					{t('gov.create.action.idle')}
				</StyledCTA>
			);
	}, [handleCreate, t, validSubmission]);

	if (signTransactionState === Transaction.WAITING) {
		return (
			<TxState
				title={t('gov.actions.propose.waiting')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<GreyHeader>{t('gov.actions.propose.signing')}</GreyHeader>
						<WhiteSubheader>
							{t('gov.actions.propose.space', {
								space: activeTab,
							})}
						</WhiteSubheader>
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (signTransactionState === Transaction.SUCCESS) {
		return (
			<TxState
				title={t('gov.actions.propose.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<GreyHeader>{t('gov.actions.propose.signed')}</GreyHeader>
						<WhiteSubheader>
							{t('gov.actions.propose.hash', {
								hash: truncateAddress(hash ?? ''),
							})}
						</WhiteSubheader>
						<Divider />
						<ButtonSpacer>
							<DismissButton
								variant="secondary"
								onClick={() => {
									setSignTransactionState(Transaction.PRESUBMIT);
									onBack();
								}}
							>
								{t('gov.actions.tx.dismiss')}
							</DismissButton>
						</ButtonSpacer>
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (txTransactionState === 'pending') {
		return (
			<TxState
				title={t('gov.actions.log-proposal.waiting')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<GreyHeader>{t('gov.actions.log-proposal.logging')}</GreyHeader>
						<WhiteSubheader>
							{t('gov.actions.log-proposal.hash', {
								hash: truncateAddress(hash ?? ''),
							})}
						</WhiteSubheader>
						<Divider />
						<GreyText>{t('gov.actions.tx.notice')}</GreyText>
						<ExternalLink href={link}>
							<LinkText>{t('gov.actions.tx.link')}</LinkText>
						</ExternalLink>
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (txTransactionState === 'confirmed') {
		return (
			<TxState
				title={t('gov.actions.log-proposal.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<GreyHeader>{t('gov.actions.log-proposal.logged')}</GreyHeader>
						<WhiteSubheader>
							{t('gov.actions.log-proposal.hash', {
								hash: truncateAddress(hash ?? ''),
							})}
						</WhiteSubheader>
						<Divider />
						<ButtonSpacer>
							{link && (
								<ExternalLink href={link}>
									<VerifyButton>{t('gov.actions.tx.verify')}</VerifyButton>
								</ExternalLink>
							)}
							<DismissButton
								variant="secondary"
								onClick={() => {
									onBack();
								}}
							>
								{t('gov.actions.tx.dismiss')}
							</DismissButton>
						</ButtonSpacer>
					</FlexDivColCentered>
				}
			/>
		);
	}

	return (
		<>
			<Container>
				<InputContainer>
					<HeaderRow>
						<IconButton onClick={() => onBack()}>
							<Svg src={NavigationBack} />
						</IconButton>
						<Header>{t('gov.create.title')}</Header>
						<div />
					</HeaderRow>
					<CreateContainer>
						<Title
							placeholder={t('gov.create.question')}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<Description
							placeholder={t('gov.create.description')}
							value={body}
							onChange={(e) => setBody(e.target.value)}
						/>
						<Divider />
						<Header>{t('gov.create.preview')}</Header>
						<Preview dangerouslySetInnerHTML={getRawMarkup(body)} />
					</CreateContainer>
				</InputContainer>
				<ActionContainer>{returnButtonStates}</ActionContainer>
			</Container>
		</>
	);
};
export default Question;

const ActionContainer = styled.div``;

const CreateContainer = styled(FlexDivColCentered)``;

const Title = styled(Input)`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
	text-align: center;
	margin: 16px 0px;
`;

const Description = styled.textarea`
	${inputCSS}
	resize: none;
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 14px;
	text-align: center;
	margin: 16px 0px;
	height: 200px;

	${media.greaterThan('mdUp')`
		width: 500px;
	`}
`;

const Preview = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	margin: 16px 0px;
	text-align: center;
	max-height: 300px;
	overflow-y: auto;

	${media.greaterThan('mdUp')`
		width: 500px;
	`}

	a {
		color: ${(props) => props.theme.colors.blue};
	}
`;
