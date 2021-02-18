import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import Button from 'components/Button';
import Input, { inputCSS } from 'components/Input/Input';
import { FlexDivRowCentered, IconButton } from 'styles/common';
import { InputContainer } from '../common';
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
		<StyledInputContainer>
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
				<p>Preview</p>
				<div dangerouslySetInnerHTML={getRawMarkup(body)} />
			</CreateContainer>
			<ActionContainer>
				<StyledCTA onClick={() => handleCreate()} variant="primary">
					{t('gov.create.action')}
				</StyledCTA>
			</ActionContainer>
		</StyledInputContainer>
	);
};
export default Question;

const StyledInputContainer = styled(InputContainer)`
	background-color: ${(props) => props.theme.colors.navy};
`;

const HeaderRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

const Header = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
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

const CreateContainer = styled.div``;

const Title = styled(Input)`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
	text-align: center;
`;

const Description = styled.textarea`
	${inputCSS}
	resize: none;
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 14px;
	text-align: center;
`;
