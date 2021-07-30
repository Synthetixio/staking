import React, { FC, ReactNode } from 'react';
import { Svg } from 'react-optimized-image';

import ClaimIcon from 'assets/svg/app/claim.svg';
import BurnIcon from 'assets/svg/app/burn.svg';
import MintIcon from 'assets/svg/app/mint.svg';

import { StakingTransactionType } from '@synthetixio/queries';

type TypeIconProps = {
	size?: 'sm' | 'md';
	type: StakingTransactionType;
};

const TypeIcon: FC<TypeIconProps> = ({ size = 'md', type }) => {
	let icon: ReactNode = null;

	let props: object = {
		width: '16',
		height: '16',
	};

	switch (type) {
		case StakingTransactionType.Burned:
			if (size === 'md') {
				props = {
					width: '30',
				};
			}

			icon = <Svg src={BurnIcon} viewBox={`0 0 ${BurnIcon.width} ${BurnIcon.height}`} {...props} />;
			break;
		case StakingTransactionType.Issued:
			if (size === 'md') {
				props = {
					width: '24',
				};
			}
			icon = (
				<Svg
					src={MintIcon}
					width="24"
					viewBox={`0 0 ${MintIcon.width} ${MintIcon.height}`}
					{...props}
				/>
			);
			break;
		case StakingTransactionType.FeesClaimed:
			if (size === 'md') {
				props = {
					width: '30',
				};
			}
			icon = (
				<Svg src={ClaimIcon} viewBox={`0 0 ${ClaimIcon.width} ${ClaimIcon.height}`} {...props} />
			);
			break;
		default:
			icon = null;
	}

	return <>{icon}</>;
};

export default TypeIcon;
