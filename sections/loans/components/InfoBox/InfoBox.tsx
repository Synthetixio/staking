import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const InfoBox: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<ContainerHeader>
				<Title>{t('loans.info.title')}</Title>
				<Subtitle>{t('loans.info.subtitle')}</Subtitle>
			</ContainerHeader>
			<ContainerBody></ContainerBody>
		</Container>
	);
};

export default InfoBox;

//

export const Container = styled.div`
	background: ${(props) => props.theme.colors.navy};
`;

export const ContainerHeader = styled.div`
	padding: 16px;
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
`;

export const ContainerBody = styled.div`
	padding: 16px;
`;

export const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
`;
export const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
`;
