import styled, { css } from 'styled-components';
import { resetButtonCSS } from 'styles/common';
import Color from 'color';

type ButtonProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant: 'primary' | 'secondary' | 'tertiary' | 'solid' | 'outline' | 'text';
  isActive?: boolean;
  isRounded?: boolean;
};

const Button = styled.button<ButtonProps>`
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  padding: 0 12px;
  border: none;
  border-radius: ${(props) => (props.isRounded ? '100px' : '4px')};
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  color: ${(props) => props.theme.colors.white};
  text-transform: capitalize;

  &:disabled {
    background: ${(props) => Color(props.theme.colors.blue).alpha(0.5).rgb().string()};
    color: ${(props) => props.theme.colors.white};
    box-shadow: none;
    cursor: not-allowed;
  }

  ${(props) =>
    props.size === 'sm' &&
    css`
      height: 24px;
      line-height: 24px;
    `}

  ${(props) =>
    props.size === 'md' &&
    css`
      height: 32px;
      line-height: 32px;
    `}

  ${(props) =>
    props.size === 'lg' &&
    css`
      padding: 0 40px;
      height: 40px;
      line-height: 40px;
    `}


  ${(props) =>
    props.size === 'xl' &&
    css`
      height: 48px;
      line-height: 48px;
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
          box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
          border: 1px solid ${(props) => props.theme.colors.blue};
        }
      }
    `}

    ${(props) =>
    props.variant === 'secondary' &&
    css`
      color: ${(props) => props.theme.colors.blue};
      background: ${(props) => props.theme.colors.grayBlue};
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
    props.variant === 'tertiary' &&
    css`
      color: ${(props) => props.theme.colors.pink};
      background: ${(props) => props.theme.colors.grayBlue};
      box-shadow: 0px 0px 15px rgba(237, 30, 255, 0.6);
      border: 1px solid ${(props) => props.theme.colors.pink};
      &:hover {
        &:not(:disabled) {
          background: ${(props) => props.theme.colors.pink};
          color: ${(props) => props.theme.colors.black};
        }
      }
    `}


    ${(props) =>
    props.variant === 'solid' &&
    css`
      color: ${(props) => props.theme.colors.white};
      background: ${(props) => props.theme.colors.navy};
      &:hover {
        &:not(:disabled) {
          background: ${(props) => props.theme.colors.mediumBlue};
        }
      }
      &:disabled {
        background: ${(props) => Color(props.theme.colors.navy).alpha(0.2).rgb().string()};
      }
    `}


    ${(props) =>
    props.variant === 'outline' &&
    css`
      color: ${(props) => props.theme.colors.white};
      background: ${(props) => props.theme.colors.navy};
      border: 1px solid ${(props) => props.theme.colors.grayBlue};
      &:hover {
        &:not(:disabled) {
          background: ${(props) => props.theme.colors.mediumBlue};
        }
      }
      &:disabled {
        background: ${(props) => Color(props.theme.colors.navy).alpha(0.2).rgb().string()};
        opacity: 0.5;
      }
    `}


    ${(props) =>
    props.variant === 'text' &&
    css`
      ${resetButtonCSS};
      color: ${props.isActive ? props.theme.colors.blue : props.theme.colors.white};
      &:hover {
        &:not(:disabled) {
          color: ${(props) => props.theme.colors.blue};
        }
      }
    `}
`;

export default Button;
