import {
  Flex,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Center,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

import { NetworkNameById, NetworkIdByName, NetworkName } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import {
  WalletIcon,
  EthereumIcon,
  ChevronDown,
  NotificationIcon,
  SettingsIcon,
  OptimismIcon,
  ChevronUp,
  KebabMenu,
  GuideIcon,
} from '../Icons';

import StakingLogo from '../StakingLogo';
import UserBalances from '../UserBalances';
import { useTranslation } from 'react-i18next';
import { truncateAddress, capitalizeFirstLetter } from '../../utils/formatters/string';

interface NavigationProps {
  currentNetwork: NetworkName;
  switchNetwork: (networkName: NetworkName) => void;
  connectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

const activeIcon = (currentNetwork: NetworkName) => {
  switch (currentNetwork) {
    case 'mainnet':
      return { icon: <EthereumIcon />, name: 'Ethereum' };
    case 'mainnet-ovm':
      return { icon: <OptimismIcon />, name: 'Optimism' };
    default:
      return { icon: null, name: null };
  }
};

const Navigation = ({
  currentNetwork,
  switchNetwork,
  connectWallet,
  isWalletConnected,
  walletAddress,
}: NavigationProps) => {
  const { t } = useTranslation();

  const { name, icon } = activeIcon(currentNetwork);
  const size = useBreakpointValue({
    base: 'mobile',
    md: 'desktop',
  });

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      bg="navy.900"
      px={[4, 4, 10]}
      py={4}
      borderBottom="1px"
      borderBottomColor="gray.900"
    >
      <StakingLogo />
      <Flex alignItems="center">
        {isWalletConnected && walletAddress ? (
          <>
            {size === 'desktop' && (
              <UserBalances
                snxBalance={wei(10000.0)}
                susdBalance={wei(9999.0)}
                isSnxLoading={false}
                isSusdLoading={false}
              />
            )}
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
              <Text ml={1} variant="nav" fontWeight={700} fontSize="12">
                {truncateAddress(walletAddress, 4, 4)}
              </Text>
            </Center>
          </>
        ) : (
          <Button variant="connect" onClick={() => connectWallet()}>
            {size === 'desktop'
              ? capitalizeFirstLetter(t('common.wallet.connect-wallet'))
              : capitalizeFirstLetter(t('common.wallet.connect-wallet-mobile'))}
          </Button>
        )}
        <Center
          ml={2}
          height={10}
          borderColor="gray.900"
          borderWidth="1px"
          borderRadius="4px"
          _hover={{
            cursor: 'pointer',
          }}
        >
          <Menu>
            {({ isOpen }) => (
              <>
                <MenuButton>
                  {icon}
                  {size === 'desktop' && (
                    <>
                      <Text variant="nav" fontWeight={700} ml={1.5} mr={2}>
                        {name}
                      </Text>
                      {isOpen ? <ChevronUp color="cyan" /> : <ChevronDown color="cyan.500" />}
                    </>
                  )}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => switchNetwork(NetworkNameById[NetworkIdByName.mainnet])}>
                    <EthereumIcon />
                    <Text variant="nav" ml={2}>
                      Ethereum Mainnet
                    </Text>
                  </MenuItem>
                  <MenuItem
                    onClick={() => switchNetwork(NetworkNameById[NetworkIdByName['mainnet-ovm']])}
                  >
                    <OptimismIcon />
                    <Text variant="nav" ml={2}>
                      Optimism
                    </Text>
                  </MenuItem>
                </MenuList>
              </>
            )}
          </Menu>
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
        {size === 'desktop' ? (
          <>
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
              <Text variant="nav" fontWeight={700}>
                {t('common.wallet.menu.help')}
              </Text>
            </Center>
          </>
        ) : (
          <Menu>
            <Center ml={2} height={10} borderColor="gray.900" borderWidth="1px" borderRadius="4px">
              <MenuButton>
                <KebabMenu />
              </MenuButton>
            </Center>
            <MenuList>
              <MenuItem>
                <Center>
                  <InfoIcon ml={0.5} mr={1.5} />
                  <Text ml={1}>{t('common.wallet.menu.help')}</Text>
                </Center>
              </MenuItem>
              <MenuItem>
                <Center>
                  <SettingsIcon color="white" />
                  <Text ml={2}>{t('common.wallet.menu.settings')}</Text>
                </Center>
              </MenuItem>
              <MenuItem>
                <GuideIcon />
                <Text ml={1}>{t('common.wallet.menu.guide')}</Text>
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Flex>
  );
};

export default Navigation;
