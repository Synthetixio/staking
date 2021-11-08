import useUserStakingData from 'hooks/useUserStakingData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import styled from 'styled-components';

const ClaimedTag: React.FC = ({ ...rest }) => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);
	const userStakingInfo = useUserStakingData(walletAddress);
	return (
		<Tag className="tag" isClaimed={userStakingInfo.hasClaimed} {...rest}>
			{userStakingInfo.hasClaimed ? t('common.status.claimed') : t('common.status.unclaimed')}
		</Tag>
	);
};

const Tag = styled.span<{ isClaimed: boolean }>`
	color: ${(props) => (props.isClaimed ? props.theme.colors.green : props.theme.colors.gray)};
	text-transform: uppercase;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

export default ClaimedTag;
