import React from 'react';
import type { FC } from 'react';

import ClaimIcon from 'assets/svg/app/claim.svg';
import BurnIcon from 'assets/svg/app/burn.svg';
import MintIcon from 'assets/svg/app/mint.svg';

import { StakingTransactionType } from '@synthetixio/queries';

type TypeIconProps = {
  size?: 'sm' | 'md';
  type: StakingTransactionType;
};

const TypeIcon: FC<TypeIconProps> = ({ size = 'md', type }) => {
  switch (type) {
    case StakingTransactionType.Burned:
      return <BurnIcon width={size === 'md' ? 30 : 16} />;
    case StakingTransactionType.Issued:
      return <MintIcon width={size === 'md' ? 24 : 16} />;
    case StakingTransactionType.FeesClaimed:
      return <ClaimIcon width={size === 'md' ? 30 : 16} />;
    default:
      return null;
  }
};

export default TypeIcon;
