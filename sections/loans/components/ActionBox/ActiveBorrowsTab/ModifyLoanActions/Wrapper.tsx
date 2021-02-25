import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import { IconButton, FlexDivRowCentered, FlexDivColCentered } from 'styles/common';

type WrapperProps = {};

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
	const router = useRouter();

	const onGoBack = () => router.back();

	return (
		<Container>
			<Header>
				<IconButton onClick={onGoBack}>
					<Svg src={NavigationBack} />
				</IconButton>
			</Header>

			<Body>{children}</Body>
		</Container>
	);
};

export const Container = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
	/* @TODO: Replace with responsive height when mobile */
	height: 600px;
`;

const Header = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

export const Body = styled(FlexDivColCentered)`
	margin: 24px auto;
	justify-content: center;
`;

export default Wrapper;
