import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { ExternalLink } from 'styles/common';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import TxState from 'sections/earn/TxState';

import {
  GreyHeader,
  WhiteSubheader,
  Divider,
  VerifyButton,
  DismissButton,
  ButtonSpacer,
  GreyText,
  LinkText,
  ActionsGrid,
  ActionsGridBox,
} from 'sections/merge-accounts/common';
import { FlexDivColCentered } from 'styles/common';
import { truncateAddress } from 'utils/formatters/string';

export const TxWaiting: FC<{
  fromAddress: string | null;
  toAddress: string | null;
  txLink: string;
}> = ({ fromAddress, toAddress, txLink }) => {
  const { t } = useTranslation();

  return (
    <TxState
      title={t('merge-accounts.nominate.tx-waiting.title')}
      content={
        <FlexDivColCentered>
          <PendingConfirmation width="78" />
          <ActionsGrid>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.nominate.tx-waiting.from')}</GreyHeader>
              <WhiteSubheader>{truncateAddress(fromAddress ?? '')}</WhiteSubheader>
            </ActionsGridBox>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.nominate.tx-waiting.to')}</GreyHeader>
              <WhiteSubheader>{truncateAddress(toAddress ?? '')}</WhiteSubheader>
            </ActionsGridBox>
          </ActionsGrid>
          <Divider />
          <GreyText>{t('earn.actions.tx.notice')}</GreyText>
          <ExternalLink href={txLink}>
            <LinkText>{t('earn.actions.tx.link')}</LinkText>
          </ExternalLink>
        </FlexDivColCentered>
      }
    />
  );
};

export const TxSuccess: FC<{
  fromAddress: string | null;
  toAddress: string | null;
  txLink: string;
  onDismiss: () => void;
}> = ({ fromAddress, toAddress, txLink, onDismiss }) => {
  const { t } = useTranslation();

  return (
    <TxState
      title={t('merge-accounts.nominate.tx-success.title')}
      content={
        <FlexDivColCentered>
          <Success width="78" />
          <ActionsGrid>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.nominate.tx-success.from')}</GreyHeader>
              <WhiteSubheader>{truncateAddress(fromAddress ?? '')}</WhiteSubheader>
            </ActionsGridBox>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.nominate.tx-success.to')}</GreyHeader>
              <WhiteSubheader>{truncateAddress(toAddress ?? '')}</WhiteSubheader>
            </ActionsGridBox>
          </ActionsGrid>
          <Divider />
          <ButtonSpacer>
            <ExternalLink href={txLink}>
              <VerifyButton>{t('merge-accounts.nominate.tx-success.verify')}</VerifyButton>
            </ExternalLink>
            <DismissButton variant="secondary" onClick={onDismiss}>
              {t('merge-accounts.nominate.tx-success.dismiss')}
            </DismissButton>
          </ButtonSpacer>
        </FlexDivColCentered>
      }
    />
  );
};
