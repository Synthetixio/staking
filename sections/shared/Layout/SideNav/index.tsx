import { FC } from 'react';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import DesktopSideNav from './DesktopSideNav';
import MobileSideNav from './MobileSideNav';

const SideNav: FC = () => {
	return (
		<div>
			<DesktopOnlyView>
				<DesktopSideNav />
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileSideNav />
			</MobileOrTabletView>
		</div>
	);
};

export default SideNav;
