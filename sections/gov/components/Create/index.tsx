import React, { useState } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';

import { FlexDivRowCentered, IconButton } from 'styles/common';

import NavigationBack from 'assets/svg/app/navigation-back.svg';

import { InputContainer } from 'sections/gov/components/common';
import { useTranslation } from 'react-i18next';
import Button from 'components/Button';

import Input, { inputCSS } from 'components/Input/Input';

type IndexProps = {
	onBack: Function;
};

const Index: React.FC<IndexProps> = ({ onBack }) => {
	const { t } = useTranslation();
	const [question, setQuestion] = useState<string>('');
	const [description, setDescription] = useState<string>('');

	const handleCreate = () => {};

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
				<IconButton onClick={() => onBack(null)}>
					<Svg src={NavigationBack} />
				</IconButton>
				<Header>{t('gov.create.title')}</Header>
				<div />
			</HeaderRow>
			<CreateContainer>
				<Question
					placeholder={t('gov.create.question')}
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
				/>
				<Description
					placeholder={t('gov.create.description')}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
				<p>Preview</p>
				<div dangerouslySetInnerHTML={getRawMarkup(description)} />
			</CreateContainer>
			<ActionContainer>
				<StyledCTA onClick={() => handleCreate()} variant="primary">
					{t('gov.create.action')}
				</StyledCTA>
			</ActionContainer>
		</StyledInputContainer>
	);
};
export default Index;

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

const Question = styled(Input)`
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
