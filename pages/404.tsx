import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { absoluteCenteredCSS, resetHeadingMixin } from 'styles/common';

const NotFoundPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('not-found.page-title')}</title>
			</Head>
			<Container>
				<Title>{t('not-found.title')}</Title>
				<Subtitle>{t('not-found.subtitle')}</Subtitle>
			</Container>
		</>
	);
};

const Container = styled.div`
	${absoluteCenteredCSS};
	text-align: center;
	margin-top: -32px;
`;

const Title = styled.h1`
	${resetHeadingMixin};
	color: ${(props) => props.theme.colors.black};
	font-family: ${(props) => props.theme.fonts.mono};
	-webkit-text-stroke: 1px ${(props) => props.theme.colors.pink};
	font-size: 160px;
`;

const Subtitle = styled.h2`
	${resetHeadingMixin};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
`;

export default NotFoundPage;
