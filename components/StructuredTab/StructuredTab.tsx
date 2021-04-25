import { Dispatch, FC, ReactNode, SetStateAction, useState, useEffect } from 'react';
import { TabButton, TabList, TabPanel } from '../Tab';
import styled from 'styled-components';

export type TabInfo = {
	title: string;
	icon?: ReactNode;
	tabChildren: ReactNode;
	key: string;
	blue: boolean;
	disabled?: boolean;
};

type StructuredTabProps = {
	tabData: TabInfo[];
	boxHeight?: number;
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
	boxPadding,
	setPanelType,
	tabHeight,
	inverseTabColor,
	currentPanel,
	singleTab,
}) => {
	const [activeTab, setActiveTab] = useState<string>(currentPanel ? currentPanel : tabData[0].key);

	useEffect(() => {
		if (currentPanel) {
			setActiveTab(currentPanel);
		}
	}, [currentPanel]);

	return (
		<div>
			<TabList noOfTabs={tabData.length}>
				{tabData.map(({ title, icon, key, blue, disabled = false }, index) => (
					<TabButton
						isSingle={singleTab}
						tabHeight={tabHeight}
						inverseTabColor={inverseTabColor}
						blue={blue}
						noOfTabs={tabData.length}
						key={`${key}-${index}-button`}
						name={title}
						active={activeTab === key}
						isDisabled={disabled}
						onClick={() => {
							setActiveTab(key);
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
			{tabData.map(({ title, tabChildren, key }, index) => (
				<TabPanel
					padding={boxPadding}
					height={boxHeight}
					key={`${key}-${index}-panel`}
					name={title}
					active={activeTab === key}
				>
					{tabChildren}
				</TabPanel>
			))}
		</div>
	);
};

const TitleContainer = styled.p`
	margin-left: 8px;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
`;

export default StructuredTab;
