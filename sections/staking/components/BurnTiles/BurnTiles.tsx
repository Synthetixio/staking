import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import BurnCircle from 'assets/svg/app/burn-circle.svg';
import BurnCustomCircle from 'assets/svg/app/burn-custom-circle.svg';
import BurnTargetCircle from 'assets/svg/app/burn-target-circle.svg';
import media from 'styles/media';
import { FlexDivCol } from 'styles/common';

import { formatPercent } from 'utils/formatters/number';

import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';
import { delegateWalletState } from 'store/wallet';

import ButtonTile from '../ButtonTile';
import Connector from 'containers/Connector';

type BurnTilesProps = {
  percentageTargetCRatio: Wei;
  burnAmountToFixCRatio: Wei;
};

const BurnTiles: React.FC<BurnTilesProps> = ({ percentageTargetCRatio, burnAmountToFixCRatio }) => {
  const { t } = useTranslation();
  const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);
  const onBurnChange = useSetRecoilState(amountToBurnState);
  const { isL2 } = Connector.useContainer();

  const delegateWallet = useRecoilValue(delegateWalletState);

  const clearDebtIsDisabled = !!(delegateWallet || isL2);

  useEffect(() => {
    onBurnChange('');
  }, [burnType, onBurnChange]);

  return (
    <Container>
      <ButtonTile
        title={t('staking.actions.burn.tiles.max.title')}
        subtext={t('staking.actions.burn.tiles.max.subtext')}
        icon={<BurnCircle width="62" />}
        onAction={() => onBurnTypeChange(BurnActionType.MAX)}
      />
      <ButtonTile
        disabled={burnAmountToFixCRatio.eq(0)}
        title={t('staking.actions.burn.tiles.target.title', {
          targetCRatio: formatPercent(percentageTargetCRatio),
        })}
        subtext={t('staking.actions.burn.tiles.target.subtext')}
        icon={<BurnTargetCircle width="62" />}
        onAction={() => onBurnTypeChange(BurnActionType.TARGET)}
      />
      <ButtonTile
        title={t('staking.actions.burn.tiles.custom.title')}
        subtext={t('staking.actions.burn.tiles.custom.subtext')}
        icon={<BurnCustomCircle width="62" />}
        onAction={() => onBurnTypeChange(BurnActionType.CUSTOM)}
      />
      <ButtonTile
        title={t('staking.actions.burn.tiles.clear-debt.title')}
        subtext={
          isL2
            ? t('common.layer-2.not-available')
            : delegateWallet
            ? t('common.delegate.not-available')
            : t('staking.actions.burn.tiles.clear-debt.subtext')
        }
        icon={<BurnCircle width="62" />}
        onAction={() => onBurnTypeChange(BurnActionType.CLEAR)}
        disabled={clearDebtIsDisabled}
      />
    </Container>
  );
};

const Container = styled(FlexDivCol)`
  width: 100%;
  flex: 1;

  ${media.greaterThan('sm')`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-column-gap: 1rem;
  `}

  ${media.lessThan('sm')`
    display: flex;
    flex-direction: column;
  `}
`;

export default BurnTiles;
