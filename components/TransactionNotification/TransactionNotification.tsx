import React, { FC, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';
import { useTranslation } from 'react-i18next';

import Spinner from 'assets/svg/app/spinner.svg';
import Success from 'assets/svg/app/success.svg';
import Failure from 'assets/svg/app/failure.svg';

type NotificationProps = {
  closeToast?: Function;
  failureReason?: string;
  link?: string;
};

const NotificationPending = () => {
  const { t } = useTranslation();
  return (
    <NotificationContainer>
      <IconContainer>
        <Spinner width="25" />
      </IconContainer>
      <TransactionInfo>{t('common.transaction.transaction-sent')}</TransactionInfo>
    </NotificationContainer>
  );
};

const NotificationSuccess = ({ link }: NotificationProps) => {
  const { t } = useTranslation();
  return (
    <NotificationContainer data-testid="tx-notification-transaction-confirmed" data-href={link}>
      <IconContainer>
        <Success width="35" />
      </IconContainer>
      <TransactionInfo>{t('common.transaction.transaction-confirmed')}</TransactionInfo>
    </NotificationContainer>
  );
};

const NotificationError = ({ failureReason }: NotificationProps) => {
  const { t } = useTranslation();
  return (
    <NotificationContainer>
      <IconContainer>
        <Failure width="35" />
      </IconContainer>
      <TransactionInfo>
        <TransactionInfoBody>{t('common.transaction.transaction-failed')}</TransactionInfoBody>
        <TransactionInfoBody isFailureMessage={true}>{failureReason}</TransactionInfoBody>
      </TransactionInfo>
    </NotificationContainer>
  );
};

const NotificationContainer = styled(FlexDivCentered)``;
const IconContainer = styled(FlexDivRowCentered)`
  width: 35px;
`;

const TransactionInfo: FC<PropsWithChildren> = styled(FlexDivCol)``;
const TransactionInfoBody: FC<PropsWithChildren<{ isFailureMessage?: boolean }>> = styled.div<{
  isFailureMessage?: boolean;
}>`
  ${(props) =>
    props.isFailureMessage &&
    css`
      color: ${(props) => props.theme.colors.gray};
    `}
`;

export { NotificationPending, NotificationSuccess, NotificationError };
