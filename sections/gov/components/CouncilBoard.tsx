import React from 'react';
import styled from 'styled-components';
import { BOX_COLUMN_WIDTH } from 'constants/styles';
import { useTranslation } from 'react-i18next';

type CouncilBoardProps = {};

const CouncilBoard: React.FC<CouncilBoardProps> = ({}) => {
	const { t } = useTranslation();
	return (
		<TabPanelContainer width={BOX_COLUMN_WIDTH} padding={20}>
			<Title>{t('gov.council.title')}</Title>
		</TabPanelContainer>
	);
};
export default CouncilBoard;

const TabPanelContainer = styled.div<{ height?: number; width: number; padding: number }>`
	outline: none;
	background: ${(props) => props.theme.colors.backgroundBlue};
	box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
	height: ${(props) => (props.height != null ? `${props.height}px` : 'unset')};
	width: ${(props) => props.width}px;
	padding: ${(props) => props.padding}px;
`;

const Title = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
	text-transform: capitalize;
`;
