import { Dispatch, FC, ReactNode, SetStateAction, useState } from 'react';
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
	boxHeight: number;
	boxWidth: number;
	boxPadding: number;
	setPanelType?: Dispatch<SetStateAction<any>>;
	tabHeight?: number;
	inverseTabColor?: boolean;
};

const StructuredTab: FC<StructuredTabProps> = ({
	tabData,
	boxHeight,
	boxWidth,
	boxPadding,
	setPanelType,
	tabHeight,
	inverseTabColor,
}) => {
	const [activeTab, setActiveTab] = useState<string>(tabData[0].title);
	return (
		<FlexDivColCentered>
			<TabList padding={boxPadding} width={boxWidth}>
				{tabData.map(({ title, icon, key, blue }, index) => (
					<TabButton
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
	font-family: ${(props) => props.theme.fonts.expanded};
	text-transform: uppercase;
`;

export default StructuredTab;
