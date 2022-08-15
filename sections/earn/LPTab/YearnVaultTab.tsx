import { FC, useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useRouter } from 'next/router';

import StructuredTab from 'components/StructuredTab';
import ApproveModal from 'components/ApproveModal';
import ROUTES from 'constants/routes';
import { FlexDivColCentered, IconButton, FlexDivJustifyEnd, FlexDivCentered } from 'styles/common';
import media from 'styles/media';
import { CurrencyKey } from 'constants/currency';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import ExpandIcon from 'assets/svg/app/expand.svg';

import { Transaction } from 'constants/network';
import { CryptoCurrency } from 'constants/currency';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import TxState from 'sections/earn/TxState';
import { EXTERNAL_LINKS } from 'constants/links';

import {
  StyledLink,
  GreyHeader,
  WhiteSubheader,
  Divider,
  DismissButton,
  ButtonSpacer,
  GreyText,
  TabContainer,
  Label,
  HeaderLabel,
} from '../common';

import styled, { useTheme } from 'styled-components';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import { MobileOnlyView } from 'components/Media';
import DepositTab from './DepositTab/DepositTab';
import Wei from '@synthetixio/wei';

type DualRewards = {
  a: Wei;
  b: Wei;
};

type LPTabProps = {
  stakedAsset: CurrencyKey;
  icon?: CurrencyKey;
  type?: CurrencyIconType;
  tokenRewards: Wei | DualRewards;
  allowance: Wei | null;
  userBalance: Wei;
  staked: Wei;
  pricePerShare: Wei;
  secondTokenRate?: Wei;
};

const YearnVaultTab: FC<LPTabProps> = ({
  stakedAsset,
  icon = stakedAsset,
  type,
  tokenRewards,
  allowance,
  userBalance,
  staked,
  pricePerShare,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showApproveOverlayModal, setShowApproveOverlayModal] = useState<boolean>(false);

  const [claimTransactionState, setClaimTransactionState] = useState<Transaction>(
    Transaction.PRESUBMIT
  );

  const router = useRouter();
  const goToEarn = useCallback(() => router.push(ROUTES.Earn.Home), [router]);

  const tabData = useMemo(() => {
    const commonDepositTabProps = {
      asset: stakedAsset,
      userBalance,
      staked,
      icon,
      type,
      pricePerShare,
    };

    return [
      {
        title: t('earn.actions.deposit.title'),
        tabChildren: <DepositTab {...commonDepositTabProps} isDeposit={true} />,
        color: theme.colors.blue,
        key: 'deposit',
      },
      {
        title: t('earn.actions.withdraw.title'),
        tabChildren: <DepositTab {...commonDepositTabProps} isDeposit={false} />,
        color: theme.colors.orange,
        key: 'withdraw',
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, stakedAsset, userBalance, staked]);

  useEffect(() => {
    if (allowance?.eq(0) && userBalance.gt(0)) {
      setShowApproveOverlayModal(true);
    }
  }, [allowance, userBalance]);

  const translationKey = 'earn.incentives.options.yvsnx.description';

  if (claimTransactionState === Transaction.WAITING) {
    return (
      <TxState
        description={
          <Label>
            <Trans
              i18nKey={translationKey}
              components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
            />
          </Label>
        }
        title={t('earn.actions.rewards.waiting')}
        content={
          <FlexDivColCentered>
            <PendingConfirmation width="78" />
            <>
              <GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
              <WhiteSubheader>
                {t('earn.actions.claim.amount', {
                  amount: (tokenRewards as Wei).toString(DEFAULT_CRYPTO_DECIMALS),
                  asset: CryptoCurrency.SNX,
                })}
              </WhiteSubheader>
            </>
            <Divider />
            <GreyText>{t('earn.actions.tx.notice')}</GreyText>
          </FlexDivColCentered>
        }
      />
    );
  }

  if (claimTransactionState === Transaction.SUCCESS) {
    return (
      <TxState
        description={
          <Label>
            <Trans
              i18nKey={translationKey}
              components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
            />
          </Label>
        }
        title={t('earn.actions.claim.success')}
        content={
          <FlexDivColCentered>
            <Success width="78" />
            <>
              <GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
              <WhiteSubheader>
                {t('earn.actions.claim.amount', {
                  amount: (tokenRewards as Wei).toString(DEFAULT_CRYPTO_DECIMALS),
                  asset: CryptoCurrency.SNX,
                })}
              </WhiteSubheader>
            </>
            <Divider />
            <ButtonSpacer>
              <DismissButton
                variant="secondary"
                onClick={() => setClaimTransactionState(Transaction.PRESUBMIT)}
              >
                {t('earn.actions.tx.dismiss')}
              </DismissButton>
            </ButtonSpacer>
          </FlexDivColCentered>
        }
      />
    );
  }

  const infoLink = 'https://yearn.finance/vaults/0xF29AE508698bDeF169B89834F76704C3B205aedf';

  return (
    <StyledTabContainer>
      <GoToEarnButtonContainer>
        <MobileOnlyView>
          <StyledIconButton onClick={goToEarn}>
            <ExpandIcon width="24" />
          </StyledIconButton>
        </MobileOnlyView>
      </GoToEarnButtonContainer>

      <HeaderLabel>
        <Trans i18nKey={translationKey} components={[<StyledLink href={infoLink} />]} />
      </HeaderLabel>
      <GridContainer>
        <StructuredTab
          tabHeight={30}
          inverseTabColor={true}
          boxPadding={0}
          boxHeight={242}
          tabData={tabData}
        />
      </GridContainer>
      {showApproveOverlayModal && (
        <ApproveModalWrapper>
          <ApproveModal
            description={t('earn.incentives.options.yvsnx.approve-message')}
            tokenContractName="Synthetix"
            contractToApproveName="YearnSNXVault"
            onApproved={() => setShowApproveOverlayModal(false)}
          />
        </ApproveModalWrapper>
      )}
    </StyledTabContainer>
  );
};

const StyledTabContainer = styled(TabContainer)`
  height: inherit;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 1rem;

  ${media.lessThan('mdUp')`
    display: flex;
    flex-direction: column;
  `}
`;

const StyledIconButton = styled(IconButton)`
  margin-left: auto;
  svg {
    color: ${(props) => props.theme.colors.gray};
  }
  &:hover {
    svg {
      color: ${(props) => props.theme.colors.white};
    }
  }
`;

const GoToEarnButtonContainer = styled(FlexDivJustifyEnd)`
  width: 100%;
`;

const ApproveModalWrapper = styled(FlexDivCentered)`
  position: absolute;
  width: calc(100% - 24px);
  height: calc(100% + 24px);
  top: 0;
`;

export default YearnVaultTab;
