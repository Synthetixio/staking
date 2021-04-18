import { FC, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Color from 'color';

import { FlexDivCentered } from 'styles/common';
import CloseIcon from 'assets/svg/app/close.svg';

type BannerProps = {
	message: JSX.Element;
	localStorageKey: string;
};

const Banner: FC<BannerProps> = ({ message, localStorageKey }) => {
	const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);

	const fetchFromLocalStorage = useCallback(() => {
		if (!localStorage.getItem(localStorageKey)) return;
		setIsBannerVisible(localStorage.getItem(localStorageKey) === 'true');
	}, [localStorageKey]);

	useEffect(() => {
		fetchFromLocalStorage();
	}, [fetchFromLocalStorage]);

	const handleHideBanner = () => {
		localStorage.setItem(localStorageKey, 'false');
		fetchFromLocalStorage();
	};

	if (!isBannerVisible) return null;
	return (
		<Container>
			<Inner>
				<Bar />
				<Message>{message}</Message>
				<ButtonClose onClick={handleHideBanner}>
					<Svg src={CloseIcon} />
				</ButtonClose>
			</Inner>
		</Container>
	);
};

const Container = styled(FlexDivCentered)`
	width: 492px;
	height: 32px;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	border-radius: 4px;
	position: absolute;
	left: 180px;
	top: 24px;
`;

const Inner = styled(FlexDivCentered)`
	height: 100%;
	position: relative;
`;

const Bar = styled.div`
	height: 100%;
	border: 2px solid ${(props) => props.theme.colors.pink};
	box-shadow: 0px 0px 15px ${(props) => Color(props.theme.colors.pink).alpha(0.6).rgb().string()};
`;

const Message = styled.div`
	padding: 0 28px 0 16px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
`;

const ButtonClose = styled.button`
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	right: 6px;
	background: none;
	border: none;
	padding: 0;
	height: 12px;
	outline: none;
	cursor: pointer;
`;

export default Banner;
