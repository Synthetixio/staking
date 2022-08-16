import SelfLiquidateTransactionButton from 'components/SelfLiquidateTransactionButton';
import BurnMaxButton from './BurnMaxButton';
import { EXTERNAL_LINKS } from 'constants/links';
import { StyledLink } from 'sections/staking/components/common';
import { formatCryptoCurrency, formatNumber, formatPercent } from 'utils/formatters/number';
import Wei, { WeiSource } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import { Synths } from 'constants/currency';
import styled from 'styled-components';
import Loader from 'components/Loader';
import { FlexDivJustifyCenter } from 'styles/common';

const formatSUSD = (val: WeiSource) =>
  formatCryptoCurrency(val, {
    sign: '$',
    currencyKey: Synths.sUSD,
    minDecimals: 2,
  });

const SelfLiquidationTabContent: React.FC<{
  percentageCurrentCRatio: Wei;
  percentageTargetCRatio: Wei;
  burnAmountToFixCRatio: Wei;
  sUSDBalance: Wei;
  selfLiquidationPenalty?: Wei;
  liquidationPenalty?: Wei;
  walletAddress: string;
  isDelegateWallet: boolean;
  SNXRate: Wei;
  amountToSelfLiquidateUsd?: Wei;
  canBurn: Boolean;
}> = ({
  isDelegateWallet,
  percentageCurrentCRatio,
  percentageTargetCRatio,
  burnAmountToFixCRatio,
  selfLiquidationPenalty,
  liquidationPenalty,
  walletAddress,
  sUSDBalance,
  SNXRate,
  amountToSelfLiquidateUsd,
  canBurn,
}) => {
  const { t } = useTranslation();

  if (isDelegateWallet) {
    return (
      <Container>
        <InfoText data-testid="liq-delegated-wallet">
          {t('staking.self-liquidation.info.delegate-wallet')}
        </InfoText>
        <Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
          {t('staking.self-liquidation.info.liquidation-link-text')}
        </Link>
      </Container>
    );
  }
  if (!percentageCurrentCRatio || percentageCurrentCRatio.eq(0)) {
    return (
      <Container>
        <InfoText data-testid="not-staking">
          {t('staking.self-liquidation.info.not-staking')}
        </InfoText>
      </Container>
    );
  }
  if (percentageCurrentCRatio.gt(percentageTargetCRatio)) {
    return (
      <Container>
        <InfoText data-testid="liq-c-ration-ok">
          {t('staking.self-liquidation.info.c-ratio-ok', {
            cRatio: formatPercent(percentageCurrentCRatio),
            targetCRatio: formatPercent(percentageTargetCRatio),
          })}
        </InfoText>
        <Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
          {t('staking.self-liquidation.info.liquidation-link-text')}
        </Link>
      </Container>
    );
  }

  if (sUSDBalance.gt(burnAmountToFixCRatio)) {
    return (
      <Container>
        <InfoText data-testid="liq-enough-susd-balance">
          {t('staking.self-liquidation.info.enough-susd-balance', {
            targetCRatio: formatPercent(percentageTargetCRatio),
            burnAmountToFixCRatio: formatSUSD(burnAmountToFixCRatio),
            balance: formatSUSD(sUSDBalance),
          })}
        </InfoText>
        <Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
          {t('staking.self-liquidation.info.liquidation-link-text')}
        </Link>
      </Container>
    );
  }

  if (!selfLiquidationPenalty || !liquidationPenalty || !amountToSelfLiquidateUsd)
    return (
      <FlexDivJustifyCenter data-testid="liq-loader">
        <Loader inline />
      </FlexDivJustifyCenter>
    );
  return (
    <Container>
      <InfoText data-testid="liq-ratios">
        {t('staking.self-liquidation.info.ratios', {
          cRatio: formatPercent(percentageCurrentCRatio),
          targetCRatio: formatPercent(percentageTargetCRatio),
        })}
      </InfoText>
      <InfoText data-testid="liq-burn-amount">
        {t('staking.self-liquidation.info.burn-amount', {
          targetCratio: formatPercent(percentageTargetCRatio),
          burnAmountToFixCRatio: formatSUSD(burnAmountToFixCRatio),
          balance: formatSUSD(sUSDBalance),
        })}
      </InfoText>
      <Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
        {t('staking.self-liquidation.info.liquidation-link-text')}
      </Link>
      {sUSDBalance.gt(0) && canBurn ? (
        <>
          <InfoText data-testid="liq-balance-not-zero">
            {t('staking.self-liquidation.info.balance-not-zero')}
          </InfoText>
          <ButtonWrapper>
            <BurnMaxButton amountToBurn={sUSDBalance} />
          </ButtonWrapper>
        </>
      ) : (
        <>
          <InfoText data-testid="self-liquidate-info">
            {t('staking.self-liquidation.info.self-liquidate-text', {
              selfLiquidationPenalty: formatPercent(selfLiquidationPenalty),
              amountToSelfLiquidate: formatCryptoCurrency(amountToSelfLiquidateUsd.div(SNXRate), {
                currencyKey: 'SNX',
                minDecimals: 2,
              }),
              amountToSelfLiquidateUsd: formatNumber(amountToSelfLiquidateUsd, {
                prefix: '$',
                minDecimals: 2,
              }),
              percentageTargetCRatio: formatPercent(percentageTargetCRatio),
            })}
          </InfoText>
          <ButtonWrapper>
            <SelfLiquidateTransactionButton walletAddress={walletAddress} />
          </ButtonWrapper>
        </>
      )}
    </Container>
  );
};

const Link = styled(StyledLink)`
  font-size: 14px;
`;
const Container = styled.div`
  width: 100%;
`;
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
const InfoText = styled.p`
  max-width: 640px;
  font-size: 14px;
`;
export default SelfLiquidationTabContent;
