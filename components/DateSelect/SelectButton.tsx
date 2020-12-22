import { HTMLProps } from 'react';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';

import { resetButtonCSS } from 'styles/common';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import CloseIcon from 'assets/svg/app/menu-close.svg';

type SelectButtonProps = HTMLProps<HTMLInputElement> & {
	isOpen: boolean;
	onClear: () => void;
	showClear: boolean;
};

const SelectButton = (
	{ onClick, value, isOpen, onClear, showClear }: SelectButtonProps,
	ref: React.Ref<HTMLInputElement>
) => (
	<Button
		className="select-button"
		// @ts-ignore
		onClick={onClick}
		isOpen={isOpen}
	>
		{value}
		<Icons>
			{showClear && (
				<CloseButton>
					<Svg
						src={CloseIcon}
						onClick={(e: any) => {
							e.stopPropagation();
							onClear();
						}}
						width="12"
						height="12"
						viewBox={`0 0 ${CloseIcon.width} ${CloseIcon.height}`}
						className="close-icon"
					/>
				</CloseButton>
			)}
			<Svg src={CaretDownIcon} className="dropdown-icon" />
		</Icons>
	</Button>
);

const Button = styled.button<{ isOpen: boolean }>`
	${resetButtonCSS};
	font-size: 12px;
	height: 40px;
	line-height: 40px;
	color: ${(props) => props.theme.colors.white};
	background: ${(props) => props.theme.colors.navy};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 10px;
	width: 100%;
	text-transform: capitalize;

	.dropdown-icon {
		color: ${(props) => props.theme.colors.gray};
		transition: transform 0.2s ease-in-out;
		&:hover {
			color: ${(props) => props.theme.colors.white};
		}
		${(props) =>
			props.isOpen &&
			css`
				color: ${(props) => props.theme.colors.white};
				transform: rotate(-180deg);
			`}
	}

	.close-icon {
		color: ${(props) => props.theme.colors.gray};
		&:hover {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

const Icons = styled.span`
	display: inline-grid;
	align-items: center;
	grid-auto-flow: column;
	grid-gap: 10px;
`;

const CloseButton = styled.button`
	${resetButtonCSS};
	width: 16px;
	height: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export default SelectButton;
