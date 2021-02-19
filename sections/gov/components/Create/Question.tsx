import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import Input, { inputCSS } from 'components/Input/Input';
import { Divider, IconButton } from 'styles/common';
import { InputContainer, Container, HeaderRow, Header, StyledCTA } from '../common';
import { useTranslation } from 'react-i18next';

type QuestionProps = {
	onBack: Function;
	setBody: Function;
	setName: Function;
	body: string;
	name: string;
	handleCreate: Function;
};

const Question: React.FC<QuestionProps> = ({
	onBack,
	setBody,
	setName,
	body,
	name,
	handleCreate,
}) => {
	const { t } = useTranslation();

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
			<ActionContainer>
				<StyledCTA onClick={() => handleCreate()} variant="primary">
					{t('gov.create.action')}
				</StyledCTA>
			</ActionContainer>
		</Container>
	);
};
export default Question;

const ActionContainer = styled.div``;

const CreateContainer = styled.div``;

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
	max-height: 150px;
`;

const Preview = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	margin: 16px 0px;
	text-align: center;
	max-height: 200px;
	overflow: scroll;

	a {
		color: ${(props) => props.theme.colors.blue};
	}
`;
