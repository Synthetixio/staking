import { CRatioHealthCard } from './CRatioHealthCard';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'CRatioHealthCard',
  component: CRatioHealthCard,
} as ComponentMeta<typeof CRatioHealthCard>;

const Template: ComponentStory<typeof CRatioHealthCard> = (props) => (
  <CRatioHealthCard {...props} />
);

export const Primary = Template.bind({});

Primary.args = {
  targetCratioPercentage: 400,
  liquidationCratioPercentage: 150,
  currentCRatioPercentage: 440,
};
