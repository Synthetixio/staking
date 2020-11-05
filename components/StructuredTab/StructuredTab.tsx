import { FC, ReactNode, useState } from 'react';
import { FlexDivColCentered } from 'styles/common';
import { TabButton, TabList, TabPanel } from '../Tab';
import styled from 'styled-components';
import { StakingPanelType } from 'pages/staking';

export type TabInfo = {
	title: string;
	icon?: () => ReactNode;
	tabChildren: ReactNode;
};

interface StructuredTabProps {
	tabData: TabInfo[];
	boxHeight: number;
	boxWidth: number;
	boxPadding: number;
	setPanelType: (type: StakingPanelType) => void;
}

const StructuredTab: FC<StructuredTabProps> = ({
	tabData,
	boxHeight,
	boxWidth,
	boxPadding,
	setPanelType,
}) => {
	const [activeTab, setActiveTab] = useState<string>(tabData[0].title);
	return (
		<FlexDivColCentered>
			<TabList padding={boxPadding} width={boxWidth}>
				{tabData.map(({ title, icon }, index) => (
					<TabButton
						numberTabs={tabData.length}
						key={`${title}-${index}-button`}
						name={title}
						active={activeTab === title}
						onClick={() => {
							setActiveTab(title);
							setPanelType(title === 'BURN' ? StakingPanelType.BURN : StakingPanelType.MINT);
						}}
					>
						{icon && icon()}
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
`;

export default StructuredTab;
