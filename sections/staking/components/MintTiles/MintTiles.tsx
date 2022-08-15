import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MintCircle from 'assets/svg/app/mint-circle.svg';
import ButtonTile from '../ButtonTile';
import { FlexDivCol } from 'styles/common';
import styled from 'styled-components';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { amountToMintState, MintActionType, mintTypeState } from 'store/staking';

type MintTilesProps = {};

const MintTiles: React.FC<MintTilesProps> = () => {
  const { t } = useTranslation();
  const [mintType, onMintTypeChange] = useRecoilState(mintTypeState);
  const onMintChange = useSetRecoilState(amountToMintState);

  useEffect(() => {
    onMintChange('');
  }, [mintType, onMintChange]);

  return (
    <Container>
      <StyledButtonTile
        title={t('staking.actions.mint.tiles.max.title')}
        subtext={t('staking.actions.mint.tiles.max.subtext')}
        icon={<MintCircle width="62" />}
        onAction={() => {
          onMintTypeChange(MintActionType.MAX);
        }}
      />
      <StyledButtonTile
        title={t('staking.actions.mint.tiles.custom.title')}
        subtext={t('staking.actions.mint.tiles.custom.subtext')}
        icon={<MintCircle width="62" />}
        onAction={() => onMintTypeChange(MintActionType.CUSTOM)}
      />
    </Container>
  );
};

const Container = styled(FlexDivCol)`
  width: 100%;
  flex: 1;
`;
const StyledButtonTile = styled(ButtonTile)`
  padding: 16px;
  flex: 1;
  margin: 8px 0px;
`;

export default MintTiles;
