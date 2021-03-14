import React from 'react';
import styled from 'styled-components';
import { Img, Svg } from 'react-optimized-image';
import { FlexDivCentered } from 'styles/common';
import i18n from 'i18n';

import Spinner from 'assets/svg/app/spinner.svg';
import Success from 'assets/svg/app/success.svg';

type NotificationProps = {
	closeToast?: Function;
	failureReason?: string;
};

const NotificationPending = () => {
	return (
		<NotificationContainer>
			<StyledImg width={25} src={Spinner} />
			<TransactionInfo>{i18n.t('common.transaction.transaction-sent')}</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationSuccess = () => {
	return (
		<NotificationContainer>
			<Svg src={Success} />
			<TransactionInfo>{i18n.t('common.transaction.transaction-confirmed')}</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationError = ({ failureReason }: NotificationProps) => {
	return (
		<NotificationContainer>
			<StyledImg width={25} src={Spinner} />
			<TransactionInfo>{i18n.t('common.transaction.transaction-failed')}</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationContainer = styled(FlexDivCentered)``;

const TransactionInfo = styled.div``;

const StyledImg = styled(Img)`
	margin-right: 10px;
`;

export { NotificationPending, NotificationSuccess, NotificationError };
