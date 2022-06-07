import { ReactNode } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { StyledTabButton } from 'components/Tab/Tab';
import { Col } from 'sections/gov/components/common';
import InfoIcon from 'assets/svg/app/info-pink.svg';

export type TabInfo = {
	title: string;
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
	font-size: 12px;
	padding: 0px 8px;
`;

export const UnstructuredTab = ({ tabData }: UnstructuredTabProps) => {
	const { title, tabChildren, key, blue, disabled } = tabData;
	const { t } = useTranslation();
	return (
		<Col>
			<StyledTabButtonExtended title={title} disabled={disabled} active blue={blue} name={key}>
				{tabData.title}
				<StyledTextWrapper>
					<StyledText>{t('gov.panel.proposals.description')}</StyledText>
					<Svg height={14} width={14} src={InfoIcon} />
				</StyledTextWrapper>
			</StyledTabButtonExtended>
			{tabChildren}
		</Col>
	);
};
