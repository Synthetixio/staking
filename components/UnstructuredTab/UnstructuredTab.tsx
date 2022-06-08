import { ReactNode } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { StyledTabButton } from 'components/Tab/Tab';
import { Col } from 'sections/gov/components/common';
import InfoIcon from 'assets/svg/app/info-pink.svg';

export type TabInfo = {
	title: string;
	description: string;
	tabChildren: ReactNode;
	key: string;
	blue: boolean;
	disabled?: boolean;
};

export type UnstructuredTabProps = {
	tabData: TabInfo;
};

const StyledTabButtonExtended = styled(StyledTabButton)`
	flex-direction: row;
	justify-content: space-between;
	padding: 0px 20px;
`;

const StyledTextWrapper = styled.div`
	background: #2a0b21;
	color: #df46fd;
	font-size: 12px;
	border-left: 3px solid #df46fd;
	display: flex;
	align-items: center;
	padding-right: 8px;
`;

const StyledText = styled.h2`
	color: #df46fd;
	font-size: 8px;
	padding: 3px 10px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.extended};
	font-weight: bold;
`;

const Title = styled.h4`
	font-size: 14px;
	margin: 0;
	font-family: ${(props) => props.theme.fonts.extended};
`;

const Description = styled.h6`
	font-size: 8px;
	color: #757688;
	margin: 0;
	text-align: left;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.extended};
`;

const Wrapper = styled(Col)`
	background: ${(props) => props.theme.colors.navy};
	padding: 5px;
`;

export const UnstructuredTab = ({ tabData }: UnstructuredTabProps) => {
	const { title, tabChildren, key, disabled } = tabData;
	const { t } = useTranslation();
	return (
		<Col>
			<StyledTabButtonExtended title={title} disabled={disabled} active name={key}>
				<Col>
					<Title>{tabData.title}</Title>
					<Description>{tabData.description}</Description>
				</Col>
				<StyledTextWrapper>
					<StyledText>{t('gov.panel.proposals.info')}</StyledText>
					<Svg height={14} width={14} src={InfoIcon} />
				</StyledTextWrapper>
			</StyledTabButtonExtended>
			<Wrapper>{tabChildren}</Wrapper>
		</Col>
	);
};
