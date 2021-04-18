import { FC } from 'react';
import styled from 'styled-components';
import { FlexDivCentered, ExternalLink } from 'styles/common';
import { Trans } from 'react-i18next';

import UserMenu from './UserMenu';
import Banner from 'sections/shared/Layout/Banner';

import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const Header: FC = () => {
	return (
		<HeaderWrapper>
			<Banner
				localStorageKey={LOCAL_STORAGE_KEYS.WARNING_URL_BANNER_VISIBLE}
				message={
					<Trans
						i18nKey={'user-menu.banner.warning-url'}
						components={[<StyledExternalLink href="https://staking.synthetix.io" />]}
					/>
				}
			/>
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

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.white};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`;

export default Header;
