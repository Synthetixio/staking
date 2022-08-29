import { FC, useEffect, useState } from 'react';
import Connector from 'containers/Connector';

import StakingLogo from 'components/StakingLogo';
import {
  Center,
  Flex,
  Text,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import {
  WalletIcon,
  EthereumIcon,
  SettingsIcon,
  ChevronDown,
  NotificationIcon,
} from 'components/Icons';
import UserBalances from 'components/UserBalances';
import { capitalizeFirstLetter, truncateAddress } from 'utils/formatters/string';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  NetworkNameById,
  NetworkIdByName,
  NetworkName,
  NetworkId,
} from '@synthetixio/contracts-interface';

const Header: FC = () => {
  const { isWalletConnected, walletAddress, connectWallet, isMainnet, network } =
    Connector.useContainer();
  const { t } = useTranslation();

  const [menuNetwork, setMenuNetwork] = useState<NetworkName>(
    isMainnet ? NetworkNameById[NetworkIdByName.mainnet] : NetworkNameById[NetworkIdByName.mainnet]
  );

  console.log('Network', network);

  useEffect(() => {
    // setMenuNetwork();
  }, [isMainnet]);

  const switchNetwork = async (networkName: NetworkName) => {
    console.log(network);
    if (network && networkName === NetworkNameById[network.id as NetworkId]) return;
    if (isWalletConnected) {
      // await switch network
      console.log('await switch network');
    }
    console.log('Here', new Date().toISOString());
    setMenuNetwork(networkName);
  };

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
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {menuNetwork}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => switchNetwork(NetworkNameById[NetworkIdByName.mainnet])}>
              Mainnet
            </MenuItem>
            <MenuItem
              onClick={() => switchNetwork(NetworkNameById[NetworkIdByName['mainnet-ovm']])}
            >
              Optimism
            </MenuItem>
          </MenuList>
        </Menu>
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
            <Button variant="connect" onClick={connectWallet}>
              {capitalizeFirstLetter(t('common.wallet.connect-wallet'))}
            </Button>
          )}
          <Center
            ml={2}
            py="6px"
            px="9.5px"
            height={10}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="4px"
            _hover={{
              cursor: 'pointer',
            }}
          >
            <EthereumIcon />
            <Text ml={1}>Ethereum</Text>
            <Icon>
              <ChevronDown color="cyan.500" />
            </Icon>
          </Center>
          <Center
            ml={2}
            height={10}
            width={10}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="4px"
            _hover={{
              cursor: 'pointer',
            }}
          >
            <NotificationIcon />
          </Center>
          <Center
            ml={2}
            height={10}
            width={10}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="4px"
            _hover={{
              cursor: 'pointer',
            }}
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
            _hover={{
              cursor: 'pointer',
            }}
          >
            <Text>Help</Text>
          </Center>
        </Flex>
      </Flex>
    </>
  );
};

export default Header;
