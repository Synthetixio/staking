import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Wei from '@synthetixio/wei';

import { ExternalLink } from 'styles/common';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import { CryptoCurrency, Synths } from 'constants/currency';
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
import { formatNumber } from 'utils/formatters/number';

export const TxWaiting: FC<{ unstakeAmount: Wei; burnAmount: Wei; txLink: string }> = ({
  unstakeAmount,
  burnAmount,
  txLink,
}) => {
  const { t } = useTranslation();

  return (
    <TxState
      title={t('merge-accounts.burn.tx-waiting.title')}
      content={
        <FlexDivColCentered>
          <PendingConfirmation width="78" />
          <ActionsGrid>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.burn.tx-waiting.unstaking')}</GreyHeader>
              <WhiteSubheader>
                {t('merge-accounts.burn.tx-waiting.unstake-amount', {
                  amount: formatNumber(unstakeAmount, {
                    minDecimals: DEFAULT_FIAT_DECIMALS,
                    maxDecimals: DEFAULT_FIAT_DECIMALS,
                  }),
                  asset: Synths.sUSD,
                })}
              </WhiteSubheader>
            </ActionsGridBox>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.burn.tx-waiting.burning')}</GreyHeader>
              <WhiteSubheader>
                {t('merge-accounts.burn.tx-waiting.burn-amount', {
                  amount: formatNumber(burnAmount, {
                    minDecimals: DEFAULT_FIAT_DECIMALS,
                    maxDecimals: DEFAULT_FIAT_DECIMALS,
                  }),
                  asset: CryptoCurrency.SNX,
                })}
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
  unstakeAmount: Wei;
  burnAmount: Wei;
  txLink: string;
  onDismiss: () => void;
}> = ({ unstakeAmount, burnAmount, txLink, onDismiss }) => {
  const { t } = useTranslation();

  return (
    <TxState
      title={t('merge-accounts.burn.tx-success.title')}
      content={
        <FlexDivColCentered>
          <Success width="78" />
          <ActionsGrid>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.burn.tx-success.unstaked')}</GreyHeader>
              <WhiteSubheader>
                {t('merge-accounts.burn.tx-success.unstaked-amount', {
                  amount: formatNumber(unstakeAmount, {
                    minDecimals: DEFAULT_FIAT_DECIMALS,
                    maxDecimals: DEFAULT_FIAT_DECIMALS,
                  }),
                  asset: Synths.sUSD,
                })}
              </WhiteSubheader>
            </ActionsGridBox>
            <ActionsGridBox>
              <GreyHeader>{t('merge-accounts.burn.tx-success.burnt')}</GreyHeader>
              <WhiteSubheader>
                {t('merge-accounts.burn.tx-success.burnt-amount', {
                  amount: formatNumber(burnAmount, {
                    minDecimals: DEFAULT_FIAT_DECIMALS,
                    maxDecimals: DEFAULT_FIAT_DECIMALS,
                  }),
                  asset: CryptoCurrency.SNX,
                })}
              </WhiteSubheader>
            </ActionsGridBox>
          </ActionsGrid>
          <Divider />
          <ButtonSpacer>
            <ExternalLink href={txLink}>
              <VerifyButton>{t('earn.actions.tx.verify')}</VerifyButton>
            </ExternalLink>
            <DismissButton variant="secondary" onClick={onDismiss}>
              {t('merge-accounts.burn.tx-success.dismiss')}
            </DismissButton>
          </ButtonSpacer>
        </FlexDivColCentered>
      }
    />
  );
};
