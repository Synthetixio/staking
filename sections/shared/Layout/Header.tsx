import { FC } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

import UserMenu from './UserMenu';
import BannerManager from 'components/BannerManager';

const Header: FC = () => {
	return (
		<HeaderWrapper>
			<BannerManager />
			<Container>
				<UserMenu />
			</Container>
		</HeaderWrapper>
	);
};

const HeaderWrapper = styled.div`
	position: relative;
`;

const Container = styled(FlexDivCentered)`
	justify-content: flex-end;
	padding: 24px 30px 0 0;
`;

export default Header;
