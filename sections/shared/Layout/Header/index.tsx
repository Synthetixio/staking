import { FC } from 'react';
import Connector from 'containers/Connector';

import StakingLogo from 'components/StakingLogo';
import { Center, Flex, Text, Button } from '@chakra-ui/react';
import {
  WalletIcon,
  EthereumIcon,
  ChevronDown,
  NotificationBellIcon,
  SettingsIcon,
} from 'components/Icons';
import UserBalances from 'components/UserBalances';
import { truncateAddress } from 'utils/formatters/string';

const Header: FC = () => {
  const { isWalletConnected, walletAddress, connectWallet } = Connector.useContainer();

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        bg="navy.900"
        px={10}
        py={4}
        borderBottom="1px"
        borderBottomColor="gray.900"
      >
        <StakingLogo />
        <Flex alignItems="center">
          {isWalletConnected && walletAddress ? (
            <>
              <UserBalances snxBalance={10000} susdBalance={9999} />
              <Center
                ml={2}
                borderColor="gray.900"
                borderWidth="1px"
                borderRadius="4px"
                height={10}
                py="6px"
                px="9.5px"
              >
                <WalletIcon />
                <Text fontFamily="inter">{truncateAddress(walletAddress, 4, 4)}</Text>
              </Center>
            </>
          ) : (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          )}
          <Center
            ml={2}
            py="6px"
            px="9.5px"
            height={10}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="4px"
          >
            <EthereumIcon width={24} height={24} />
            <Text ml={1}>Ethereum</Text>
            <ChevronDown />
          </Center>
          <Center
            ml={2}
            height={10}
            width={10}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="4px"
          >
            <NotificationBellIcon />
          </Center>
          <Center
            ml={2}
            height={10}
            width={10}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="4px"
          >
            <SettingsIcon />
          </Center>
          <Center
            ml={2}
            height={10}
            px={4}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="4px"
            onClick={() => console.log('Help')}
          >
            <Text>Help</Text>
          </Center>
        </Flex>
      </Flex>
    </>
  );
};

export default Header;
