import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ClaimedTag from 'components/ClaimedTag';
import { TabContainer } from '../common';
import { FlexDivRowCentered } from 'styles/common';

interface ClaimTabProps {}

const ClaimTab: React.FC<ClaimTabProps> = ({}) => {
	const { t } = useTranslation();
	const claimed = true;
	return (
		<TabContainer>
			<Label>{t('earn.actions.claim.exchange-rewards')}</Label>
			<ValueBox>
				<Value isClaimed={false}>18.36 sUSD</Value>
				<StyledClaimedTag isClaimed={claimed} />
			</ValueBox>
			<Label>{t('earn.actions.claim.staking-rewards')}</Label>
			<ValueBox>
				<Value isClaimed={false}>117.65 SNX</Value>
				<StyledClaimedTag isClaimed={claimed} />
			</ValueBox>
		</TabContainer>
	);
};

const Label = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	font-size: 12px;
`;
const Value = styled.p<{ isClaimed: boolean }>`
	color: ${(props) =>
		props.isClaimed ? props.theme.colors.white : props.theme.colors.borderSilver};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 26px;
`;
const ValueBox = styled(FlexDivRowCentered)``;

const StyledClaimedTag = styled(ClaimedTag)`
	font-size: 14px;
	margin-left: 8px;
`;

export default ClaimTab;
