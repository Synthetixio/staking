import { FC, ReactNode } from 'react';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import styled from 'styled-components';

import CrossIcon from 'assets/svg/app/cross.svg';

import Card from 'components/Card';
import { resetButtonCSS } from 'styles/common';
import { zIndex } from 'constants/ui';
import media from 'styles/media';

type BaseModalProps = {
  title: ReactNode;
  isOpen?: boolean;
  onDismiss: () => void;
  children: ReactNode;
  showCross?: boolean;
};

export const BaseModal: FC<BaseModalProps> = ({
  onDismiss,
  title,
  children,
  isOpen,
  showCross = true,
  ...rest
}) => (
  <StyledDialogOverlay onDismiss={onDismiss} isOpen={isOpen} {...rest}>
    <StyledDialogContent aria-label="modal">
      <StyledCard className="card">
        <StyledCardHeader className="card-header">
          {title}
          {showCross && (
            <DismissButton onClick={onDismiss}>
              <CrossIcon width="16" />
            </DismissButton>
          )}
        </StyledCardHeader>
        <StyledCardBody className="card-body">{children}</StyledCardBody>
      </StyledCard>
    </StyledDialogContent>
  </StyledDialogOverlay>
);

const StyledDialogOverlay = styled(DialogOverlay)`
  z-index: ${zIndex.DIALOG_OVERLAY};
  padding: 0px 200px;
  background: hsla(0, 0%, 0%, 0.8);

  ${media.lessThan('md')`
    padding: 0px 40px;
  `}

  ${media.lessThan('sm')`
    overflow: hidden;
  `}
`;

const StyledDialogContent = styled(DialogContent)`
  padding: 0;
  border: 0;
  background: ${(props) => props.theme.colors.navy};
  ${media.lessThan('sm')`
    &&& {    
      width: 100%;
      margin: 0;
    }
  `}
`;

const StyledCard = styled(Card)`
  height: 100%;
  background: ${(props) => props.theme.colors.navy};
`;

const StyledCardHeader = styled(Card.Header)`
  justify-content: center;
  height: 48px;
`;

const StyledCardBody = styled(Card.Body)`
  ${media.lessThan('sm')`
    &&& {
      max-height: unset;
      height: unset;
    }
  `}
`;

const DismissButton = styled.button`
  ${resetButtonCSS};
  position: absolute;
  right: 20px;
  color: ${(props) => props.theme.colors.white};
  &:hover {
    color: ${(props) => props.theme.colors.blue};
  }
`;

export default BaseModal;
