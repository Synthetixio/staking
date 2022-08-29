import { Banner } from './Banner';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Banner',
  component: Banner,
} as ComponentMeta<typeof Banner>;

const Template: ComponentStory<typeof Banner> = (props) => <Banner {...props} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  variant: 'success',
  text: 'You can now collect your weekly rewards',
  countDown: '0D 14H 08M',
};
