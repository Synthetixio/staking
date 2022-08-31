import { Navigation } from '.';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Navigation',
  component: Navigation,
} as ComponentMeta<typeof Navigation>;

const Template: ComponentStory<typeof Navigation> = (_args) => <Navigation {..._args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  currentNetwork: 1,
  connectWallet: () => {},
  isWalletConnected: true,
  walletAddress: '0xada3f268965c7410dfa0d74b928D950D94fAa554',
  switchNetwork: () => {},
};
