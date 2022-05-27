import { Dispatch, FC, ReactNode, SetStateAction, useState, useEffect } from 'react';
import styled from 'styled-components';

import Select from 'components/Select';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { TabButton, TabList, TabPanel } from '../Tab';

export type TabInfo = {
	title: string;
	icon?: ReactNode;
	tabChildren: ReactNode;
	key: string;
	color?: string;
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

	const desktop = () => (
		<TabList noOfTabs={tabData.length}>
			{tabData.map(({ title, icon, key, color, disabled = false }, index) => (
				<TabButton
					isSingle={singleTab}
					tabHeight={tabHeight}
					inverseTabColor={inverseTabColor}
					color={color}
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
	);

	const mobile = () => (
		<Select
			inputId={'tabs'}
			formatOptionLabel={(option) => option.title}
			options={tabData}
			value={tabData.find(({ key }) => key === activeTab)}
			onChange={(option: any) => {
				if (option) {
					setActiveTab(option.key);
					if (setPanelType != null) {
						setPanelType(option.key);
					}
				}
			}}
			variant="outline"
		/>
	);

	return (
		<div>
			<DesktopOnlyView>{desktop()}</DesktopOnlyView>
			<MobileOrTabletView>{tabData.length <= 2 ? desktop() : mobile()}</MobileOrTabletView>
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
