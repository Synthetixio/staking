import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import { Svg } from 'react-optimized-image';

import { ExternalLink, FlexDiv } from 'styles/common';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import { CryptoCurrency, Synths } from 'constants/currency';
import TxState from 'sections/earn/TxState';

import {
	GreyHeader,
	WhiteSubheader,
	Divider,
	VerifyButton,
	DismissButton,
	ButtonSpacer,
	GreyText,
	LinkText,
} from 'sections/earn/common';
import { FlexDivColCentered } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';

export const TxWaiting: FC<{
	fromAddress: string | null;
	toAddress: string | null;
	txLink: string;
}> = ({ fromAddress, toAddress, txLink }) => {
	const { t } = useTranslation();

	return (
		<TxState
			title={t('merge-accounts.nominate.tx-waiting.title')}
			content={
				<FlexDivColCentered>
					<Svg src={PendingConfirmation} />
					<StyledFlexDiv>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('merge-accounts.nominate.tx-waiting.from')}</GreyHeader>
							<WhiteSubheader>{truncateAddress(fromAddress ?? '')}</WhiteSubheader>
						</StyledFlexDivColCentered>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('merge-accounts.nominate.tx-waiting.to')}</GreyHeader>
							<WhiteSubheader>{truncateAddress(toAddress ?? '')}</WhiteSubheader>
						</StyledFlexDivColCentered>
					</StyledFlexDiv>
					<Divider />
					<GreyText>{t('earn.actions.tx.notice')}</GreyText>
					<ExternalLink href={txLink}>
						<LinkText>{t('earn.actions.tx.link')}</LinkText>
					</ExternalLink>
				</FlexDivColCentered>
			}
		/>
	);
};

export const TxSuccess: FC<{
	fromAddress: string | null;
	toAddress: string | null;
	txLink: string;
	onDismiss: () => void;
}> = ({ fromAddress, toAddress, txLink, onDismiss }) => {
	const { t } = useTranslation();

	return (
		<TxState
			title={t('merge-accounts.nominate.tx-success.title')}
			content={
				<FlexDivColCentered>
					<Svg src={Success} />
					<StyledFlexDiv>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('merge-accounts.nominate.tx-success.from')}</GreyHeader>
							<WhiteSubheader>{truncateAddress(fromAddress ?? '')}</WhiteSubheader>
						</StyledFlexDivColCentered>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('merge-accounts.nominate.tx-success.to')}</GreyHeader>
							<WhiteSubheader>{truncateAddress(toAddress ?? '')}</WhiteSubheader>
						</StyledFlexDivColCentered>
					</StyledFlexDiv>
					<Divider />
					<ButtonSpacer>
						<ExternalLink href={txLink}>
							<VerifyButton>{t('merge-accounts.nominate.tx-success.verify')}</VerifyButton>
						</ExternalLink>
						<DismissButton variant="secondary" onClick={onDismiss}>
							{t('merge-accounts.nominate.tx-success.dismiss')}
						</DismissButton>
					</ButtonSpacer>
				</FlexDivColCentered>
			}
		/>
	);
};

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
	padding: 20px 30px;
`;

const StyledFlexDiv = styled(FlexDiv)`
	margin-bottom: -20px;
`;
