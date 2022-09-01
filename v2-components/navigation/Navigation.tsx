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

import { NetworkIdByName, NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import {
  WalletIcon,
  EthereumIcon,
  ChevronDown,
  NotificationsIcon,
  SettingsIcon,
  OptimismIcon,
  ChevronUp,
  KebabMenu,
  GuideIcon,
  FailedIcon,
  InfoIcon,
} from '../icons';

import { StakingLogo } from '../staking-logo';
import { StakingIcon } from '../icons';
import { UserBalances } from '../user-balances';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from '../../utils/formatters/string';

interface NavigationProps {
  currentNetwork: NetworkId;
  switchNetwork: (networkId: NetworkId) => void;
  connectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

const activeIcon = (currentNetwork: NetworkId) => {
  switch (currentNetwork) {
    case 1:
      return { icon: <EthereumIcon />, name: 'Ethereum' };
    case 10:
      return { icon: <OptimismIcon />, name: 'Optimism' };
    case 5:
      return { icon: <EthereumIcon />, name: 'Goerli Testnet' };
    case 420:
      return { icon: <OptimismIcon />, name: 'Optimistic Goerli' };

    default:
      return { icon: <FailedIcon width="24px" height="24px" />, name: 'Unsupported Network' };
  }
};

export const Navigation = ({
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
      {size === 'desktop' ? <StakingLogo /> : <StakingIcon />}
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
          <Button
            variant="connect"
            onClick={() => connectWallet()}
            sx={{ textTransform: 'capitalize' }}
          >
            {size === 'desktop'
              ? t('common.wallet.connect-wallet')
              : t('common.wallet.connect-wallet-mobile')}
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
                  <MenuItem onClick={() => switchNetwork(NetworkIdByName.mainnet)}>
                    <EthereumIcon />
                    <Text variant="nav" ml={2}>
                      Ethereum Mainnet
                    </Text>
                  </MenuItem>
                  <MenuItem onClick={() => switchNetwork(NetworkIdByName['mainnet-ovm'])}>
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
          <NotificationsIcon />
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
                  <Text ml={1}>{t('common.wallet.menu.settings')}</Text>
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
