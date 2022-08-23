import { FC } from 'react';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import BannerManager from 'components/BannerManager';
import UserMenu from '../UserMenu';
import MobileTabletMenu from './MobileTabletMenu';
import StakingLogo from 'components/StakingLogo';
import { Flex, useTheme } from '@chakra-ui/react';
import SUSDIcon from 'components/Icons/SUSDIcon';
import SNXIcon from 'components/Icons/SNXIcon';

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
        px={10}
        py={6}
        borderBottom="1px"
        sx={{
          borderBottomColor: `${theme.colors.gray['600']}30`,
        }}
      >
        <StakingLogo />
        <SUSDIcon />
        <SNXIcon />
        <MobileOrTabletView>
          <MobileTabletMenu />
        </MobileOrTabletView>
        <UserMenu />
      </Flex>
    </>
  );
};

export default Header;
