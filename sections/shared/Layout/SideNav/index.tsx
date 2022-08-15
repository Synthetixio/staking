import { FC } from 'react';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import DesktopSideNav from './Desktop';
import MobileSideNav from './Mobile';

const SideNav: FC = () => {
  return (
    <>
      <DesktopOnlyView>
        <DesktopSideNav />
      </DesktopOnlyView>
      <MobileOrTabletView>
        <MobileSideNav />
      </MobileOrTabletView>
    </>
  );
};

export default SideNav;
