import React from 'react';
import { useTranslation } from 'react-i18next';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import styled from 'styled-components';

const ClaimedTag: React.FC = ({ ...rest }) => {
	const { t } = useTranslation();
	const claimed = useClaimedStatus();
	return (
		<Tag className="tag" isClaimed={claimed} {...rest}>
			{claimed ? t('common.status.claimed') : t('common.status.unclaimed')}
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
