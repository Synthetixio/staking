import { MainActionCard } from './MainActionCard';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'MainActionCard',
  component: MainActionCard,
} as ComponentMeta<typeof MainActionCard>;

const Template: ComponentStory<typeof MainActionCard> = (props) => <MainActionCard {...props} />;

export const Primary = Template.bind({});

Primary.args = {
  targetCratioPercentage: 400,
  liquidationCratioPercentage: 150,
  currentCRatioPercentage: 440,
  epoch: '07:14:55',
  isFlagged: false,
  isStaking: true,
  hasClaimed: false,
};
