import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { StyledButton } from '../common';
import { Tooltip } from 'styles/common';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import ROUTES from 'constants/routes';

const ClaimAndCloseFeeButton: React.FC<{
  handleClaim: () => void;
  handleCloseFeePeriod: () => void;
  canClaim: boolean;
  isBelowCRatio: boolean;
  hasVoted: boolean;
  hasClaimed: boolean;
  totalRewards: Wei;
  isCloseFeePeriodEnabled: boolean;
}> = ({
  handleClaim,
  handleCloseFeePeriod,
  canClaim,
  isBelowCRatio,
  hasClaimed,
  isCloseFeePeriodEnabled,
  totalRewards,
  hasVoted,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <PaddedButtonContainer>
      <Tooltip
        hideOnClick={true}
        arrow={true}
        placement="bottom"
        content={t('earn.actions.claim.ratio-notice')}
        disabled={!canClaim || !isBelowCRatio}
      >
        {!hasVoted ? (
          <PaddedButton variant="primary" onClick={() => router.push(ROUTES.Gov.Home)}>
            {t('earn.actions.claim.not-voted')}
          </PaddedButton>
        ) : isBelowCRatio ? (
          <PaddedButton variant="primary" onClick={() => router.push(ROUTES.Staking.Burn)}>
            {t('earn.actions.claim.low-ratio')}
          </PaddedButton>
        ) : (
          <PaddedButton variant="primary" onClick={handleClaim} disabled={!canClaim}>
            {hasClaimed
              ? t('earn.actions.claim.claimed-button')
              : totalRewards.gt(0)
              ? t('earn.actions.claim.claim-button')
              : t('earn.actions.claim.nothing-to-claim')}
          </PaddedButton>
        )}
      </Tooltip>
      {isCloseFeePeriodEnabled && (
        <PaddedButton variant="primary" onClick={handleCloseFeePeriod}>
          {t('earn.actions.claim.close-fee-period')}
        </PaddedButton>
      )}
    </PaddedButtonContainer>
  );
};

const PaddedButtonContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const PaddedButton = styled(StyledButton)`
  margin-top: 20px;
  text-transform: uppercase;
`;

export default ClaimAndCloseFeeButton;
