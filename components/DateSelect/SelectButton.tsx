import { HTMLProps } from 'react';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';

import { resetButtonCSS } from 'styles/common';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';

type SelectButtonProps = HTMLProps<HTMLInputElement> & { isOpen: boolean };

const SelectButton = (
	{ onClick, value, isOpen }: SelectButtonProps,
	ref: React.Ref<HTMLInputElement>
) => (
	<Button
		className="select-button"
		// @ts-ignore
		onClick={onClick}
		isOpen={isOpen}
	>
		{value}
		<Svg src={CaretDownIcon} />
	</Button>
);

const Button = styled.button<{ isOpen: boolean }>`
	${resetButtonCSS};
	font-size: 12px;
	height: 40px;
	line-height: 40px;
	color: ${(props) => props.theme.colors.white};
	background: ${(props) => props.theme.colors.mediumBlue};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 17px;
	width: 100%;
	svg {
		transition: transform 0.2s ease-in-out;
		${(props) =>
			props.isOpen &&
			css`
				transform: rotate(-180deg);
			`}
	}
`;

export default SelectButton;
