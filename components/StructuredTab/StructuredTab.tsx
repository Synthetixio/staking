import { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import styled from 'styled-components';

import Select from 'components/Select';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { TabButton, TabList, TabPanel } from '../Tab';
import { Col } from 'sections/gov/components/common';

export type TabInfo = {
  title: string;
  description?: string;
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
  tabHeight?: number;
  inverseTabColor?: boolean;
  setActiveTab?: Dispatch<SetStateAction<any>>;
  activeTab?: string;
  singleTab?: boolean;
};

const StructuredTab: FC<StructuredTabProps> = ({
  tabData,
  boxHeight,
  boxPadding,
  tabHeight,
  inverseTabColor,
  activeTab,
  setActiveTab,
  singleTab,
}) => {
  const activeTabOrFirstTab = activeTab ? activeTab : tabData[0].key;

  const desktop = () => (
    <TabList noOfTabs={tabData.length}>
      {tabData.map(({ title, description, icon, key, color, disabled = false }, index) => (
        <TabButton
          isSingle={singleTab}
          tabHeight={tabHeight}
          inverseTabColor={inverseTabColor}
          color={color}
          key={`${key}-${index}-button`}
          name={title}
          active={activeTabOrFirstTab === key}
          isDisabled={disabled}
          onClick={() => {
            if (setActiveTab != null) {
              setActiveTab(key);
            }
          }}
        >
          {icon != null && icon}
          <Col>
            <TitleContainer>{title}</TitleContainer>
            {description && <Description>{description}</Description>}
          </Col>
        </TabButton>
      ))}
    </TabList>
  );

  const mobile = () => (
    <Select
      inputId={'tabs'}
      formatOptionLabel={(option) => option.title}
      options={tabData}
      value={tabData.find(({ key }) => key === activeTabOrFirstTab)}
      onChange={(option: any) => {
        if (option) {
          if (setActiveTab != null) {
            setActiveTab(option.key);
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
          active={activeTabOrFirstTab === key}
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
  margin: 0;
  color: ${(props) => props.theme.colors.white};
`;

const Description = styled.h6`
  font-size: 8px;
  color: ${(props) => props.theme.colors.gray};
  margin: 0;
  text-transform: uppercase;
  font-family: ${(props) => props.theme.fonts.extended};
  text-align: center;
`;

export default StructuredTab;
