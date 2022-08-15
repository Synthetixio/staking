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

export const TxWaiting: FC<{ txLink: string }> = ({ txLink }) => {
  const { t } = useTranslation();

  return (
    <TxState
      title={t('merge-accounts.merge.tx-waiting.title')}
      content={
        <FlexDivColCentered>
          <PendingConfirmation width="78" />
          <ActionsGrid single>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.merge.tx-waiting.merging')}</GreyHeader>
              <WhiteSubheader>
                {t('merge-accounts.merge.tx-waiting.escrowed-schedule')}
              </WhiteSubheader>
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
  txLink: string;
  onDismiss: () => void;
}> = ({ txLink, onDismiss }) => {
  const { t } = useTranslation();

  return (
    <TxState
      title={t('merge-accounts.merge.tx-success.title')}
      content={
        <FlexDivColCentered>
          <Success width="78" />
          <ActionsGrid single>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.merge.tx-success.merged')}</GreyHeader>
              <WhiteSubheader>
                {t('merge-accounts.merge.tx-success.escrowed-schedule')}
              </WhiteSubheader>
            </ActionsGridBox>
          </ActionsGrid>
          <Divider />
          <ButtonSpacer>
            <ExternalLink href={txLink}>
              <VerifyButton>{t('merge-accounts.merge.tx-success.verify')}</VerifyButton>
            </ExternalLink>
            <DismissButton variant="secondary" onClick={onDismiss}>
              {t('merge-accounts.merge.tx-success.dismiss')}
            </DismissButton>
          </ButtonSpacer>
        </FlexDivColCentered>
      }
    />
  );
};
