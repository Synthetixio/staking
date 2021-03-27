import styled from 'styled-components';
import { FC, ReactNode, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { FlexDivCol, Row } from 'styles/common';
import { TabButton, TabList, TabPanelContainer } from '../../../../components/Tab';
import { DebtPanelType } from 'store/debt';
import DebtHedgingInfoPanel from '../DebtHedgingInfoPanel';

export type TabInfo = {
	title: string;
	icon?: ReactNode;
	tabChildren: ReactNode;
	key: string;
	disabled?: boolean;
	width?: number;
};

type DebtTabsProps = {
	tabData: TabInfo[];
	boxHeight?: number;
	boxWidth: number;
	boxPadding: number;
	tabHeight?: number;
	currentPanel?: string;
	setPanelType?: Dispatch<SetStateAction<any>>;
};

const DebtTabs: FC<DebtTabsProps> = ({
	tabData,
	boxHeight,
	boxWidth,
	boxPadding,
	tabHeight,
	currentPanel,
	setPanelType,
}) => {
	const [activeTab, setActiveTab] = useState<string>(currentPanel ? currentPanel : tabData[0].key);

	useEffect(() => {
		if (currentPanel) {
			setActiveTab(currentPanel);
		}
	}, [currentPanel]);

	return (
		<Row>
			<DebtTabsContainer>
				<TabList padding={boxPadding} width={boxWidth}>
					{tabData.map(({ title, icon, key, disabled = false }, index) => (
						<TabButton
							isSingle={false}
							tabHeight={tabHeight}
							blue={true}
							numberTabs={tabData.length}
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
				{tabData.map(
					({ title, tabChildren, key, width }, index) =>
						activeTab === key && (
							<TabPanelFullWidth
								id={`${title}-tabpanel`}
								role="tabpanel"
								aria-labelledby={`${title}-tab`}
								tabIndex={-1}
								padding={boxPadding}
								height={boxHeight}
								width={width || 0}
								key={`${key}-${index}-panel`}
							>
								{tabChildren}
							</TabPanelFullWidth>
						)
				)}
			</DebtTabsContainer>
			<DebtHedgingInfoPanel hidden={activeTab !== DebtPanelType.MANAGE} />
		</Row>
	);
};

const DebtTabsContainer = styled(FlexDivCol)`
	width: 100%;
`;

const TabPanelFullWidth = styled(TabPanelContainer)`
	width: ${(props) => (props.width ? `${props.width}px` : '100%')};
`;

const TitleContainer = styled.p`
	margin-left: 8px;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
`;

export default DebtTabs;
