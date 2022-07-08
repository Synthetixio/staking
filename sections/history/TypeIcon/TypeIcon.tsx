import React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import ClaimIcon from 'assets/svg/app/claim.svg';
import BurnIcon from 'assets/svg/app/burn.svg';
import MintIcon from 'assets/svg/app/mint.svg';

import { StakingTransactionType } from '@synthetixio/queries';

type TypeIconProps = {
	size?: 'sm' | 'md';
	type: StakingTransactionType;
};

const TypeIcon: FC<TypeIconProps> = ({ size = 'md', type }) => {
	const { t } = useTranslation();

	switch (type) {
		case StakingTransactionType.Burned:
			return (
				<img
					src={BurnIcon}
					width={size === 'md' ? 30 : 16}
					alt={t('history.table.staking-tx-type.burned')}
				/>
			);
		case StakingTransactionType.Issued:
			return (
				<img
					src={MintIcon}
					width={size === 'md' ? 24 : 16}
					alt={t('history.table.staking-tx-type.issued')}
				/>
			);
		case StakingTransactionType.FeesClaimed:
			return (
				<img
					src={ClaimIcon}
					width={size === 'md' ? 30 : 16}
					alt={t('history.table.staking-tx-type.feesClaimed')}
				/>
			);
		default:
			return null;
	}
};

export default TypeIcon;
