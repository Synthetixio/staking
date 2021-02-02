import { Dispatch, FC, ReactNode, SetStateAction, useState, useEffect } from 'react';
import { FlexDivColCentered } from 'styles/common';
import { TabButton, TabList, TabPanel } from '../Tab';
import styled from 'styled-components';

export type TabInfo = {
	title: string;
	icon?: ReactNode;
	tabChildren: ReactNode;
	key: string;
	blue: boolean;
};

type StructuredTabProps = {
	tabData: TabInfo[];
	boxHeight?: number;
	boxWidth: number;
	boxPadding: number;
	setPanelType?: Dispatch<SetStateAction<any>>;
	tabHeight?: number;
	inverseTabColor?: boolean;
	currentPanel?: string;
	singleTab?: boolean;
};

const StructuredTab: FC<StructuredTabProps> = ({
	tabData,
	boxHeight,
	boxWidth,
	boxPadding,
	setPanelType,
	tabHeight,
	inverseTabColor,
	currentPanel,
	singleTab,
}) => {
	const [activeTab, setActiveTab] = useState<string>(
		currentPanel ? currentPanel : tabData[0].title
	);

	useEffect(() => {
		if (currentPanel) {
			setActiveTab(currentPanel);
		}
	}, [currentPanel]);

	return (
		<FlexDivColCentered>
			<TabList padding={boxPadding} width={boxWidth}>
				{tabData.map(({ title, icon, key, blue }, index) => (
					<TabButton
						isSingle={singleTab}
						tabHeight={tabHeight}
						inverseTabColor={inverseTabColor}
						blue={blue}
						numberTabs={tabData.length}
						key={`${title}-${index}-button`}
						name={title}
						active={activeTab === title}
						onClick={() => {
							setActiveTab(title);
							if (setPanelType != null) {
								setPanelType(key);
							}
						}}
					>
						{icon != null && icon}
						<TitleContainer>{title}</TitleContainer>
					</TabButton>
				))}
			</TabList>
			{tabData.map(({ title, tabChildren }, index) => (
				<TabPanel
					padding={boxPadding}
					height={boxHeight}
					width={boxWidth}
					key={`${title}-${index}-panel`}
					name={title}
					activeTab={activeTab}
				>
					{tabChildren}
				</TabPanel>
			))}
		</FlexDivColCentered>
	);
};

const TitleContainer = styled.p`
	margin-left: 8px;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
`;

export default StructuredTab;
