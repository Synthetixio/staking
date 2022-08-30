import { CRatioProgressBar } from './CRatioProgressBar';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'CRatioProgressBar',
  component: CRatioProgressBar,
} as ComponentMeta<typeof CRatioProgressBar>;

const Template: ComponentStory<typeof CRatioProgressBar> = (props) => (
  <CRatioProgressBar {...props} />
);

export const Primary = Template.bind({});
Primary.args = {
  targetCratioPercentage: 400,
  liquidationCratioPercentage: 150,
  currentCRatioPercentage: 440,
};
