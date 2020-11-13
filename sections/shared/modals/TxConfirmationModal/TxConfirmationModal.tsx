import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Svg } from 'react-optimized-image';
import { FlexDivColCentered } from 'styles/common';

import { CurrencyKey } from 'constants/currency';

import BaseModal from 'components/BaseModal';

import { formatCurrency } from 'utils/formatters/number';
import Button from 'components/Button';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';

type TxConfirmationModalProps = {
	onDismiss: () => void;
	txError: boolean;
	attemptRetry: () => void;
	quoteCurrencyKey: CurrencyKey;
	quoteCurrencyAmount: string;
	baseCurrencyKey: CurrencyKey;
	baseCurrencyAmount: string;
};

export const TxConfirmationModal: FC<TxConfirmationModalProps> = ({
	onDismiss,
	txError,
	attemptRetry,
	quoteCurrencyKey,
	baseCurrencyKey,
	quoteCurrencyAmount,
	baseCurrencyAmount,
}) => {
	const { t } = useTranslation();

	return (
		<StyledBaseModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.confirm-transaction.title')}
		>
			<FlexDivColCentered>
				<Svg src={PendingConfirmation} />
			</FlexDivColCentered>
			<Currencies>
				<CurrencyItem>
					<CurrencyItemTitle>{t('modals.confirm-transaction.staking.from')}</CurrencyItemTitle>
					<CurrencyItemText>
						{formatCurrency(quoteCurrencyKey, quoteCurrencyAmount, {
							currencyKey: quoteCurrencyKey,
							decimals: 4,
						})}
					</CurrencyItemText>
				</CurrencyItem>
				<CurrencyItem>
					<CurrencyItemTitle>{t('modals.confirm-transaction.staking.to')}</CurrencyItemTitle>
					<CurrencyItemText>
						{formatCurrency(baseCurrencyKey, baseCurrencyAmount, {
							currencyKey: baseCurrencyKey,
							decimals: 4,
						})}
					</CurrencyItemText>
				</CurrencyItem>
			</Currencies>
			<Subtitle>{t('modals.confirm-transaction.helper')}</Subtitle>
			{txError && (
				<Actions>
					<Message>{t('common.transaction.error')}</Message>
					<MessageButton onClick={attemptRetry}>{t('common.transaction.reattempt')}</MessageButton>
				</Actions>
			)}
		</StyledBaseModal>
	);
};

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 270px;
	}
	.card-header {
		text-transform: uppercase;
		background-color: ${(props) => props.theme.colors.mediumBlue};
	}
	.card-body {
		padding: 24px;
		background-color: ${(props) => props.theme.colors.mediumBlue};
	}
`;

const Currencies = styled.div`
	display: grid;
	grid-gap: 24px;
	padding: 24px 0px;
	justify-content: center;
	grid-auto-flow: column;
	align-items: flex-end;
`;

const CurrencyItem = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.white};
`;

const CurrencyItemTitle = styled.div`
	padding-bottom: 8px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.silver};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const CurrencyItemText = styled.div`
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.interSemiBold};
`;

const Subtitle = styled.div`
	text-align: center;
	color: ${(props) => props.theme.colors.silver};
	padding-bottom: 48px;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.interSemiBold};
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

const MessageButton = styled(Button).attrs({
	variant: 'primary',
	size: 'lg',
	isRounded: true,
})``;

export default TxConfirmationModal;
