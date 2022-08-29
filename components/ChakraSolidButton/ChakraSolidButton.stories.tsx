import ChakraSolidButton from './ChakraSolidButton';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'ChakraSolidButton',
  component: ChakraSolidButton,
} as ComponentMeta<typeof ChakraSolidButton>;

const Template: ComponentStory<typeof ChakraSolidButton> = (_args) => (
  <ChakraSolidButton>{_args.children}</ChakraSolidButton>
);

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  children: 'Hello World',
};
