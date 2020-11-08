import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface ClaimedTagProps {
	isClaimed: boolean;
}

const ClaimedTag: React.FC<ClaimedTagProps> = ({ isClaimed, ...rest }) => {
	const { t } = useTranslation();
	return (
		<Tag className="tag" isClaimed={isClaimed} {...rest}>
			{isClaimed ? t('common.status.claimed') : t('common.status.unclaimed')}
		</Tag>
	);
};

const Tag = styled.span<{ isClaimed: boolean }>`
	color: ${(props) =>
		props.isClaimed ? props.theme.colors.brightGreen : props.theme.colors.silver};
	text-transform: uppercase;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

export default ClaimedTag;
