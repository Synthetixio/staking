import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { EXTERNAL_LINKS } from 'constants/links';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { delegateWalletState } from 'store/wallet';
import styled from 'styled-components';
import { ExternalLink, LineSpacer } from 'styles/common';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { formatCryptoCurrency, formatPercent, isZero } from 'utils/formatters/number';
import WarningIcon from 'assets/svg/app/warning.svg';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import useGetSnxAmountToBeLiquidatedUsd from 'hooks/useGetSnxAmountToBeLiquidatedUsd';
import SelfLiquidateTransactionButton from 'components/SelfLiquidateTransactionButton';
import Connector from 'containers/Connector';

const SelfLiquidationText: React.FC<{
  totalSNXBalance: Wei;
  amountToBeSelfLiquidated: Wei;
  amountOfNonSelfLiquidation: Wei;
  escrowedSnx: Wei;
  SNXRate: Wei;
  selfLiquidationPenalty: Wei;
  targetCRatio: Wei;
}> = ({
  totalSNXBalance,
  amountToBeSelfLiquidated,
  amountOfNonSelfLiquidation,
  escrowedSnx,
  SNXRate,
  selfLiquidationPenalty,
  targetCRatio,
}) => {
  const nonEscrowedSNX = totalSNXBalance.sub(escrowedSnx);
  // If SNX rate is 0 we need to wait for data
  if (isZero(SNXRate)) return null;
  const snxToBeSelfLiquidated = amountToBeSelfLiquidated.div(SNXRate);
  const snxToBeLiquidated = amountOfNonSelfLiquidation.div(SNXRate);
  const formatSNX = (amount: Wei) =>
    formatCryptoCurrency(amount, {
      currencyKey: 'SNX',
      maxDecimals: 2,
      minDecimals: 2,
    });

  if (snxToBeSelfLiquidated.lt(nonEscrowedSNX)) {
    return (
      <InfoText>
        Self liquidating will cause a loss of {formatSNX(snxToBeSelfLiquidated)}, if someone else
        liquidates you, you would lose {formatSNX(snxToBeLiquidated)}
      </InfoText>
    );
  }
  return (
    <InfoText>
      Self liquidating would cause you to lose all your none escrowed SNX. With the self liquidation
      penalty of {formatPercent(selfLiquidationPenalty)} you would need{' '}
      {formatSNX(snxToBeSelfLiquidated)} to get back to {formatPercent(targetCRatio)}. Your non
      escrowed balance is {formatSNX(nonEscrowedSNX)}
    </InfoText>
  );
};

const FlagWarningText: React.FC<{
  liquidationDeadlineForAccount: Wei;
  percentageTargetCRatio: Wei;
}> = ({ liquidationDeadlineForAccount, percentageTargetCRatio }) => {
  const { t } = useTranslation();
  return (
    <>
      <Title>{t('staking.flag-warning.title')}</Title>
      <InfoText>
        <Trans
          i18nKey={'staking.flag-warning.info'}
          components={[
            <Strong />,
            <StyledExternalLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations} />,
          ]}
          values={{
            deadlineDate: formatShortDateWithTime(liquidationDeadlineForAccount.toNumber() * 1000),
            percentageTargetCRatio: formatPercent(percentageTargetCRatio),
          }}
        />
      </InfoText>
    </>
  );
};
const CratioUnderLiquidationRatioWarning: React.FC<{
  currentCRatioPercent: Wei;
  liquidationRatioPercent: Wei;
  liquidationDelay: Wei;
}> = ({ currentCRatioPercent, liquidationDelay, liquidationRatioPercent }) => {
  return (
    <>
      <Title>Low C-Ratio</Title>
      <InfoText>
        {`Your C-Ratio (${formatPercent(
          currentCRatioPercent
        )}) is below the liquidation C-Ratio ${formatPercent(
          liquidationRatioPercent
        )}. This means you might get flagged. If you get flagged you have ${Math.round(
          liquidationDelay.toNumber() / 60 / 60
        )} hours before someone can liquidate you.`}
      </InfoText>
    </>
  );
};

const SelfLiquidation: React.FC<{
  percentageTargetCRatio: Wei;
  percentageCurrentCRatio: Wei;
  totalSNXBalance: Wei;
  debtBalance: Wei;
  escrowedSnx: Wei;
  SNXRate: Wei;
}> = ({
  percentageTargetCRatio,
  percentageCurrentCRatio,
  totalSNXBalance,
  escrowedSnx,
  SNXRate,
  debtBalance,
}) => {
  const { useGetLiquidationDataQuery } = useSynthetixQueries();

  const { walletAddress } = Connector.useContainer();
  const delegateWallet = useRecoilValue(delegateWalletState);
  const isDelegateWallet = Boolean(delegateWallet?.address);
  const liquidationQuery = useGetLiquidationDataQuery(walletAddress);
  const liquidationData = liquidationQuery.data;
  const canSelfLiquidate =
    percentageCurrentCRatio?.gt(0) &&
    percentageCurrentCRatio.lt(percentageTargetCRatio) &&
    !isDelegateWallet;

  const snxAmountToBeLiquidatedUsdQuery = useGetSnxAmountToBeLiquidatedUsd(
    debtBalance,
    totalSNXBalance?.mul(SNXRate),
    liquidationData?.selfLiquidationPenalty,
    liquidationData?.liquidationPenalty,
    canSelfLiquidate
  );

  const snxAmountToBeLiquidatedUsd = snxAmountToBeLiquidatedUsdQuery.data;

  // You cant self liquidate with delegation
  if (delegateWallet?.address) return null;
  // Wait for data
  if (liquidationData === undefined || snxAmountToBeLiquidatedUsd === undefined) return null;
  // If c-ratio is 0 (user not staking) dont render self liquidation
  if (isZero(percentageCurrentCRatio)) return null;
  // If liquidationRatio is set to zero I guess liquidation must be turned off
  if (isZero(liquidationData.liquidationRatio)) return null;

  const liquidationDeadlineForAccount = liquidationData.liquidationDeadlineForAccount;
  const notBeenFlagged = liquidationDeadlineForAccount.eq(0);

  const liquidationRatioPercent = wei(1).div(liquidationData.liquidationRatio); //0.6666 = 1.50
  const currentCRatioBelowLiquidationCRatio = percentageCurrentCRatio.gt(liquidationRatioPercent);
  // Only render if flagged or below LiquidationCratio
  if (notBeenFlagged && currentCRatioBelowLiquidationCRatio) return null;

  return (
    <>
      <Container>
        <WarningIcon width="72" />
        {notBeenFlagged ? (
          <CratioUnderLiquidationRatioWarning
            currentCRatioPercent={percentageCurrentCRatio}
            liquidationRatioPercent={liquidationRatioPercent}
            liquidationDelay={liquidationData.liquidationDelay}
          />
        ) : (
          <FlagWarningText
            liquidationDeadlineForAccount={liquidationDeadlineForAccount}
            percentageTargetCRatio={percentageTargetCRatio}
          />
        )}

        <SelfLiquidationText
          totalSNXBalance={totalSNXBalance}
          amountToBeSelfLiquidated={snxAmountToBeLiquidatedUsd.amountToSelfLiquidateUsd}
          amountOfNonSelfLiquidation={snxAmountToBeLiquidatedUsd.amountToLiquidateUsd}
          escrowedSnx={escrowedSnx}
          SNXRate={SNXRate}
          selfLiquidationPenalty={liquidationData.selfLiquidationPenalty}
          targetCRatio={percentageTargetCRatio}
        />
        <ButtonWrapper>
          <SelfLiquidateTransactionButton walletAddress={walletAddress} />
        </ButtonWrapper>
        <LineSpacer />
      </Container>
    </>
  );
};

const ButtonWrapper = styled.div`
  margin-bottom: 30px;
`;

const Strong = styled.strong`
  font-family: ${(props) => props.theme.fonts.condensedBold};
`;
const StyledExternalLink = styled(ExternalLink)`
  color: ${(props) => props.theme.colors.blue};
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const InfoText = styled.p`
  max-width: 640px;
  font-size: 14px;
`;
const Title = styled.h3`
  font-family: ${(props) => props.theme.fonts.condensedBold};
  color: ${(props) => props.theme.colors.white};
  font-size: 16px;
  margin: 8px 24px;
`;

export default SelfLiquidation;
