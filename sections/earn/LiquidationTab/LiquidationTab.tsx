import React, { useState, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import { delegateWalletState } from 'store/wallet';
import ROUTES from 'constants/routes';
import { ExternalLink, FlexDiv, GlowingCircle, IconButton, FlexDivJustifyEnd } from 'styles/common';
import media from 'styles/media';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import ExpandIcon from 'assets/svg/app/expand.svg';

import Etherscan from 'containers/BlockExplorer';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import { formatCurrency, formatFiatCurrency, formatNumber } from 'utils/formatters/number';
import { StyledButton } from '../common';

import { CryptoCurrency } from 'constants/currency';
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
} from '../common';

import GasSelector from 'components/GasSelector';

import largeWaveSVG from 'assets/svg/app/large-wave.svg';

import {
  ErrorMessage,
  FlexDivCentered,
  FlexDivColCentered,
  ModalContent,
  ModalItem,
} from 'styles/common';
import { EXTERNAL_LINKS } from 'constants/links';
import Currency from 'components/Currency';

import {
  TotalValueWrapper,
  Subtext,
  Value,
  Label,
  StyledLink,
  TabContainer,
  HeaderLabel,
} from '../common';
import { MobileOnlyView } from 'components/Media';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import Connector from 'containers/Connector';

type LiquidationTabProps = {
  liquidationRewards: Wei;
  refetchAllRewards: () => void;
};

const LiquidationTab: React.FC<LiquidationTabProps> = ({
  liquidationRewards,
  refetchAllRewards,
}) => {
  const { t } = useTranslation();

  const { isAppReady, isWalletConnected, walletAddress } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const addressToUse = delegateWallet?.address || walletAddress!;
  const { useSynthetixTxn, useExchangeRatesQuery } = useSynthetixQueries();
  const exchangeRatesQuery = useExchangeRatesQuery({ keepPreviousData: true });
  const SNXRate = exchangeRatesQuery.data?.SNX ?? wei(0);

  const { blockExplorerInstance } = Etherscan.useContainer();
  const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

  const router = useRouter();
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);

  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const getRewardCall: [string, string[]] = ['getReward', [addressToUse]];

  const txn = useSynthetixTxn('LiquidatorRewards', getRewardCall[0], getRewardCall[1], gasPrice, {
    enabled: Boolean(addressToUse),
    onSuccess: () => {
      setTxModalOpen(false);
      refetchAllRewards();
    },
  });

  const link = useMemo(
    () =>
      blockExplorerInstance != null && txn.hash != null
        ? blockExplorerInstance.txLink(txn.hash)
        : undefined,
    [blockExplorerInstance, txn.hash]
  );

  const canClaim = liquidationRewards.gt(0);

  const handleClaim = () => {
    if (!isAppReady || !isWalletConnected || !canClaim) return;
    setTxModalOpen(true);
    txn.mutate();
  };

  const goToEarn = useCallback(() => router.push(ROUTES.Earn.Home), [router]);

  if (txn.txnStatus === 'pending') {
    return (
      <TxState
        description={
          <Label>
            <Trans
              i18nKey="earn.incentives.options.liquidations.description"
              components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
            />
          </Label>
        }
        title={t('earn.actions.claim.in-progress')}
        content={
          <FlexDivColCentered>
            <PendingConfirmation width="78" />
            <StyledFlexDiv>
              <StyledFlexDivColCentered>
                <GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
                <WhiteSubheader>
                  {t('earn.actions.claim.amount', {
                    amount: formatNumber(liquidationRewards, {
                      minDecimals: DEFAULT_FIAT_DECIMALS,
                      maxDecimals: DEFAULT_FIAT_DECIMALS,
                    }),
                    asset: CryptoCurrency.SNX,
                  })}
                </WhiteSubheader>
              </StyledFlexDivColCentered>
            </StyledFlexDiv>
            <Divider />
            <GreyText>{t('earn.actions.tx.notice')}</GreyText>
            <ExternalLink href={link}>
              <LinkText>{t('earn.actions.tx.link')}</LinkText>
            </ExternalLink>
          </FlexDivColCentered>
        }
      />
    );
  }

  if (txn.txnStatus === 'confirmed') {
    return (
      <TxState
        description={
          <Label>
            <Trans
              i18nKey="earn.incentives.options.liquidations.description"
              components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations} />]}
            />
          </Label>
        }
        title={t('earn.actions.claim.success')}
        content={
          <FlexDivColCentered>
            <Success width="78" />
            <StyledFlexDiv>
              <StyledFlexDivColCentered>
                <GreyHeader>{t('earn.actions.claim.claimed')}</GreyHeader>
                <WhiteSubheader>
                  {t('earn.actions.claim.amount', {
                    amount: formatNumber(liquidationRewards, {
                      minDecimals: DEFAULT_FIAT_DECIMALS,
                      maxDecimals: DEFAULT_FIAT_DECIMALS,
                    }),
                    asset: CryptoCurrency.SNX,
                  })}
                </WhiteSubheader>
              </StyledFlexDivColCentered>
            </StyledFlexDiv>
            <Divider />
            <ButtonSpacer>
              {link ? (
                <ExternalLink href={link}>
                  <VerifyButton>{t('earn.actions.tx.verify')}</VerifyButton>
                </ExternalLink>
              ) : null}
              <DismissButton
                variant="secondary"
                onClick={() => {
                  refetchAllRewards();
                  goToEarn();
                }}
              >
                {t('earn.actions.tx.dismiss')}
              </DismissButton>
            </ButtonSpacer>
          </FlexDivColCentered>
        }
      />
    );
  }

  return (
    <>
      <StyledTabContainer>
        <GoToEarnButtonContainer>
          <MobileOnlyView>
            <StyledIconButton onClick={goToEarn}>
              <ExpandIcon />
            </StyledIconButton>
          </MobileOnlyView>
        </GoToEarnButtonContainer>

        <HeaderLabel>
          <Trans
            i18nKey="earn.incentives.options.liquidations.description"
            components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations} />]}
          />
        </HeaderLabel>
        <InnerContainer>
          <ValueBoxWrapper>
            <ValueBox>
              <StyledGlowingCircle variant="green" size="md">
                <Currency.Icon currencyKey={CryptoCurrency.SNX} width="36" height="36" />
              </StyledGlowingCircle>
              <Value>
                {formatCurrency(CryptoCurrency.SNX, liquidationRewards, {
                  currencyKey: CryptoCurrency.SNX,
                })}
              </Value>
              <Subtext>{t('earn.incentives.options.liquidations.liquidation-rewards')}</Subtext>
            </ValueBox>
          </ValueBoxWrapper>
          <TotalValueWrapper>
            <Subtext>{t('earn.incentives.options.liquidations.total-value')}</Subtext>
            <Value>
              {formatFiatCurrency(getPriceAtCurrentRate(liquidationRewards.mul(SNXRate)), {
                sign: selectedPriceCurrency.sign,
              })}
            </Value>
          </TotalValueWrapper>
          {txn.isError && <ErrorMessage>{txn.errorMessage}</ErrorMessage>}
          <PaddedButton variant="primary" onClick={handleClaim} disabled={!canClaim}>
            {liquidationRewards.gt(0)
              ? t('earn.actions.claim.claim-button')
              : t('earn.actions.claim.nothing-to-claim')}
          </PaddedButton>
          <GasSelector
            altVersion={true}
            optimismLayerOneFee={txn.optimismLayerOneFee}
            gasLimitEstimate={txn.gasLimit}
            onGasPriceChange={setGasPrice}
          />
        </InnerContainer>
      </StyledTabContainer>
      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={txn.errorMessage}
          attemptRetry={handleClaim}
          content={
            <ModalContent>
              <ModalItem>
                <StyledFlexDiv>
                  <StyledFlexDivColCentered>
                    <GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
                    <WhiteSubheader>
                      {t('earn.actions.claim.amount', {
                        amount: formatNumber(liquidationRewards, {}),
                        asset: CryptoCurrency.SNX,
                      })}
                    </WhiteSubheader>
                  </StyledFlexDivColCentered>
                </StyledFlexDiv>
              </ModalItem>
            </ModalContent>
          }
        />
      )}
    </>
  );
};

const InnerContainer = styled(FlexDivColCentered)`
  padding: 20px;
  border: 1px solid ${(props) => props.theme.colors.pink};
  border-radius: 4px;
  background-image: url(${largeWaveSVG.src});
  background-size: cover;
`;

const ValueBoxWrapper = styled(FlexDivCentered)`
  justify-content: space-around;
  ${media.greaterThan('mdUp')`
    width: 380px;
  `}
  ${media.lessThan('md')`
    grid-gap: 1rem;
  `}
`;

const ValueBox = styled(FlexDivColCentered)`
  ${media.greaterThan('mdUp')`
    width: 175px;
  `}
`;

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
  padding: 20px 30px;
  &:first-child {
    border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
  }
`;

const StyledFlexDiv = styled(FlexDiv)`
  margin-bottom: -20px;
`;

const StyledGlowingCircle = styled(GlowingCircle)`
  margin-bottom: 12px;
`;

const StyledTabContainer = styled(TabContainer)`
  height: inherit;
`;

const StyledIconButton = styled(IconButton)`
  margin-left: auto;
  color: ${(props) => props.theme.colors.gray};
  &:hover {
    color: ${(props) => props.theme.colors.white};
  }
`;

const GoToEarnButtonContainer = styled(FlexDivJustifyEnd)`
  width: 100%;
`;
const PaddedButton = styled(StyledButton)`
  margin-top: 20px;
  text-transform: uppercase;
`;
export default LiquidationTab;
