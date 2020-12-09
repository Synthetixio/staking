import styled, { css } from 'styled-components';
import { resetButtonCSS } from 'styles/common';

type ButtonProps = {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	variant: 'primary' | 'secondary' | 'outline' | 'alt' | 'danger' | 'text';
	isActive?: boolean;
	isRounded?: boolean;
};

const Button = styled.button<ButtonProps>`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	height: 32px;
	font-size: 12px;
	padding: 0 12px;
	border-radius: ${(props) => (props.isRounded ? '100px' : '4px')};
	border: none;
	white-space: nowrap;
	cursor: pointer;
	outline: none;
    color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;

  &:disabled {
		opacity: 0.2;
		color: ${(props) => props.theme.colors.white};
		cursor: default;
	}

	${(props) =>
		props.size === 'sm' &&
		css`
			height: 24px;
		`}

	${(props) =>
		props.size === 'md' &&
		css`
			height: 32px;
		`}

	${(props) =>
		props.size === 'lg' &&
		css`
			padding: 0 40px;
			height: 40px;
		`}		


	${(props) =>
		props.size === 'xl' &&
		css`
			height: 48px;
		`}				

	${(props) =>
		props.variant === 'primary' &&
		css`
			color: ${(props) => props.theme.colors.black};
			background: ${(props) => props.theme.colors.blue};
			box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.6);
			border: 1px solid transparent;
			&:hover {
				&:not(:disabled) {
					background: ${(props) => props.theme.colors.blueHover};
					color: ${(props) => props.theme.colors.blue};
					box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
					border: 1px solid ${(props) => props.theme.colors.blue};
				}
			}
		`}

		${(props) =>
			props.variant === 'secondary' &&
			css`
				color: ${(props) => props.theme.colors.black};
				background-color: ${(props) => props.theme.colors.blue};
				box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
				border: 1px solid ${(props) => props.theme.colors.blue};
				&:hover {
					&:not(:disabled) {
						background: ${(props) => props.theme.colors.blueHover};
						color: ${(props) => props.theme.colors.black};
					}
				}
			`}	

		
		${(props) =>
			props.variant === 'alt' &&
			css`
				color: ${(props) => props.theme.colors.white};
				background: ${(props) => props.theme.colors.orange};
				box-shadow: 0px 0px 10px rgba(252, 135, 56, 0.6);
				&:hover {
					&:not(:disabled) {
						background: ${(props) => props.theme.colors.orange};
					}
				}
			`}		

		${(props) =>
			props.variant === 'outline' &&
			css`
				border-radius: 2px;
				color: ${(props) => props.theme.colors.white};
				background-color: ${(props) => props.theme.colors.black};
				border: 1px solid ${(props) => props.theme.colors.mediumBlue};
				&:hover {
					&:not(:disabled) {
						color: ${(props) => props.theme.colors.white};
						background-color: ${(props) => props.theme.colors.mediumBlue};
					}
				}
			`}		


		${(props) =>
			props.variant === 'text' &&
			css`
				${resetButtonCSS};
				color: ${(props) => props.theme.colors.white};
				&:hover {
					&:not(:disabled) {
						color: ${(props) => props.theme.colors.gray};
					}
				}
			`}	
`;

export default Button;
