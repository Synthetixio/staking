import styled, { css, keyframes } from 'styled-components';
import media from 'styles/media';
import { DESKTOP_SIDE_NAV_WIDTH, MOBILE_BODY_PADDING } from 'constants/ui';
import Tippy from '@tippyjs/react';

export const FlexDiv = styled.div`
  display: flex;
`;

export const FlexDivCentered = styled(FlexDiv)`
  align-items: center;
`;

export const FlexDivCol = styled(FlexDiv)`
  flex-direction: column;
`;

export const FlexDivColCentered = styled(FlexDivCol)`
  align-items: center;
`;

export const FlexDivRow = styled(FlexDiv)`
  justify-content: space-between;
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
  align-items: center;
`;

export const FlexDivJustifyCenter = styled(FlexDiv)`
  justify-content: center;
`;

export const FlexDivJustifyEnd = styled(FlexDiv)`
  justify-content: flex-end;
`;

export const FlexDivItemsCenter = styled(FlexDiv)`
  align-items: center;
`;

export const linkCSS = css`
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

export const ExternalLink = styled.a.attrs({
  target: '_blank',
  rel: 'noreferrer noopener',
})`
  ${linkCSS};
`;

export const resetButtonCSS = css`
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
  padding: 0;
`;

export const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOutAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const GridDiv = styled.div`
  display: grid;
`;

export const GridDivCentered = styled(GridDiv)`
  align-items: center;
`;

export const GridDivRow = styled(GridDiv)`
  grid-auto-flow: row;
`;

export const GridDivCenteredRow = styled(GridDivCentered)`
  grid-auto-flow: row;
`;

export const GridDivCol = styled(GridDiv)`
  grid-auto-flow: column;
`;

export const GridDivCenteredCol = styled(GridDivCentered)`
  grid-auto-flow: column;
`;

export const numericValueCSS = css`
  font-family: ${(props) => props.theme.fonts.mono};
`;

export const NumericValue = styled.span`
  ${numericValueCSS};
`;

export const NoTextTransform = styled.span`
  text-transform: none;
`;

export const TextButton = styled.button`
  ${resetButtonCSS};
  background: transparent;
`;

export const SelectableCurrencyRow = styled(FlexDivRowCentered)<{ isSelectable: boolean }>`
  padding: 5px 0;
  ${(props) =>
    props.isSelectable
      ? css`
          cursor: pointer;
          &:hover {
            background-color: ${(props) => props.theme.colors.black};
          }
        `
      : css`
          cursor: default;
        `}
`;

export const CapitalizedText = styled.span`
  text-transform: capitalize;
`;

export const absoluteCenteredCSS = css`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const AbsoluteCenteredDiv = styled.div`
  ${absoluteCenteredCSS};
`;

export const FixedFooterMixin = `
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0;
`;

export const MobileContainerMixin = `
  padding-top: 55px;
  margin: 0 auto;
`;

export const Paragraph = styled.p`
  margin: 0;
`;

export const ResponsiveImage = styled.img`
  width: 100%;
`;

export const BoldText = styled.span`
  font-family: ${(props) => props.theme.fonts.condensedBold};
`;

export const BottomShadow = styled.div`
  background: linear-gradient(360deg, #10101e 0%, rgba(16, 16, 30, 0) 100%);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 16px;
  pointer-events: none;
`;

export const FullScreenContainer = styled(FlexDiv)`
  flex-flow: column;
  width: 100%;
  height: 100vh;
  position: relative;
`;

export const Row = styled(FlexDivRow)`
  margin: 20px 0px;
`;

export const Column = styled(FlexDivCol)`
  width: 50%;
`;

export const StatsSection = styled(FlexDivRowCentered)`
  width: 100%;
  justify-content: center;
  margin: 0 auto;
`;

export const LineSpacer = styled.div`
  height: 32px;
  &:after {
    background: ${(props) => props.theme.colors.grayBlue};
    height: 1px;
    position: absolute;
    content: '';

    ${media.greaterThan('mdUp')`
      width: calc(100% - ${DESKTOP_SIDE_NAV_WIDTH}px);
      left: ${DESKTOP_SIDE_NAV_WIDTH}px;
    `}

    ${media.lessThan('mdUp')`
      left: ${MOBILE_BODY_PADDING}px;
      right: ${MOBILE_BODY_PADDING}px;
    `}
  }
`;

export const VerticalSpacer = styled.div`
  height: 32px;
`;

export const ErrorMessage = styled.p`
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.interSemiBold};
  text-align: center;
  text-transform: capitalize;
  color: ${(props) => props.theme.colors.pink};
`;

export const ModalContent = styled.div`
  display: grid;
  grid-gap: 24px;
  padding: 24px 0px;
  justify-content: center;
  grid-auto-flow: column;
  align-items: flex-end;
  border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
`;

export const ModalItem = styled.div`
  text-align: center;
  padding: 16px 0px;
`;

export const ModalItemTitle = styled.div`
  padding-bottom: 8px;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.gray};
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.interBold};
`;

export const ModalItemText = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.interBold};
`;

export const ModalItemSeperator = styled.div`
  background: ${(props) => props.theme.colors.grayBlue};
  width: 1px;
  height: 100px;
`;

export const TableNoResults = styled.div`
  padding: 50px 0;
  text-align: center;
  background-color: ${(props) => props.theme.colors.navy};
`;

export const TableNoResultsTitle = styled.div`
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.extended};
  padding-bottom: 4px;
  color: ${(props) => props.theme.colors.white};
`;

export const TableNoResultsDesc = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.colors.gray};
`;

export const TableNoResultsButtonContainer = styled.div`
  margin-top: 16px;
  button {
    text-transform: uppercase;
    padding-left: 30px;
    padding-right: 30px;
  }
`;

export const resetHeadingMixin = `
  margin: 0;
  font-weight: normal;
  line-height: normal;
`;

export const IconButton = styled.button`
  ${resetButtonCSS};
  background: transparent;
`;

export const boxShadowBlue = css`
  box-shadow: 0px 0px 15px ${(props) => props.theme.colors.blue};
  border: 1px solid ${(props) => props.theme.colors.blue};
`;

export const Divider = styled.div`
  background: ${(props) => props.theme.colors.grayBlue};
  height: 1px;
  width: 100%;
`;

export const GlowingCircle = styled(FlexDivCentered)<{
  variant: 'blue' | 'green' | 'orange' | 'yellow' | 'purple';
  size: 'sm' | 'md' | 'lg';
}>`
  border-radius: 50%;
  justify-content: center;

  ${(props) =>
    props.size === 'sm' &&
    css`
      height: 32px;
      min-width: 32px;
    `}

  ${(props) =>
    props.size === 'md' &&
    css`
      height: 56px;
      min-width: 56px;
    `}

  ${(props) =>
    props.size === 'lg' &&
    css`
      height: 64px;
      min-width: 64px;
    `}

  ${(props) =>
    props.variant === 'green' &&
    css`
      border: 1.5px solid ${(props) => props.theme.colors.green};
      box-shadow: 0px 0px 15px ${(props) => props.theme.colors.green};
    `}

  ${(props) =>
    props.variant === 'blue' &&
    css`
      border: 1.5px solid ${(props) => props.theme.colors.blue};
      box-shadow: 0px 0px 15px ${(props) => props.theme.colors.blue};
    `}

  ${(props) =>
    props.variant === 'green' &&
    css`
      border: 1.5px solid ${(props) => props.theme.colors.green};
      box-shadow: 0px 0px 15px ${(props) => props.theme.colors.green};
    `}

  ${(props) =>
    props.variant === 'orange' &&
    css`
      border: 1.5px solid ${(props) => props.theme.colors.orange};
      box-shadow: 0px 0px 15px ${(props) => props.theme.colors.orange};
    `}

  ${(props) =>
    props.variant === 'purple' &&
    css`
      border: 1.5px solid ${(props) => props.theme.colors.purple};
      box-shadow: 0px 0px 15px ${(props) => props.theme.colors.purple};
    `}

  ${(props) =>
    props.variant === 'yellow' &&
    css`
      border: 1.5px solid ${(props) => props.theme.colors.yellow};
      box-shadow: 0px 0px 15px ${(props) => props.theme.colors.yellow};
    `}
`;

export const Tooltip = styled(Tippy)`
  background: ${(props) => props.theme.colors.mediumBlue};
  border-radius: 4px;
  .tippy-arrow {
    color: ${(props) => props.theme.colors.mediumBlue};
  }
  .tippy-content {
    font-size: 12px;
    padding: 10px;
  }
`;

export const UpperCased = styled.span`
  text-transform: uppercase;
`;

export const BlueStyledExternalLink = styled(ExternalLink)`
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.blue};
  font-size: 12px;
`;
