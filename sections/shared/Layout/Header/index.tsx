import { FC } from 'react';

import { DesktopOnlyView } from 'components/Media';
import BannerManager from 'components/BannerManager';

import StakingLogo from 'components/StakingLogo';
import { Center, Flex, useTheme, Text } from '@chakra-ui/react';
import {
  SUSDIcon,
  SNXIcon,
  WalletIcon,
  EthereumIcon,
  ChevronDown,
  NotificationBellIcon,
  SettingsIcon,
} from 'components/Icons';

const Header: FC = () => {
  const theme = useTheme();
  return (
    <>
      <DesktopOnlyView>
        <BannerManager />
      </DesktopOnlyView>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        bg="navy.900"
        px={10}
        py={6}
        borderBottom="1px"
        sx={{
          borderBottomColor: `${theme.colors.gray['600']}30`,
        }}
      >
        <StakingLogo />
        <Flex>
          <Center
            border="gray.900"
            borderWidth="1px"
            borderRightWidth="0.5px"
            py={'6px'}
            px={'9.5px'}
          >
            <SNXIcon pr={2} />
            <Text>18289.98</Text>
          </Center>
          <Center
            border="gray.900"
            borderWidth="1px"
            borderLeftWidth="0.5px"
            py={'6px'}
            px={'9.5px'}
            sx={{ marginInlineStart: 0 }}
          >
            <SUSDIcon pr={2} />
            <Text>18289.98</Text>
          </Center>
          <Center>
            <WalletIcon />
            <Text>0x6d...6b2b</Text>
          </Center>
          <Center>
            <EthereumIcon />
            <Text>Ethereum</Text>
            <ChevronDown />
          </Center>
          <Center>
            <NotificationBellIcon />
          </Center>
          <Center>
            <SettingsIcon />
          </Center>
          <Center>
            <Text>Help</Text>
          </Center>
        </Flex>
      </Flex>
    </>
  );
};

export default Header;
