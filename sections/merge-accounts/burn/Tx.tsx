import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
	Label,
	StyledLink,
} from 'sections/earn/common';
import { FlexDivColCentered } from 'styles/common';
import { EXTERNAL_LINKS } from 'constants/links';
import { formatNumber } from 'utils/formatters/number';

export const TxWaiting: FC<{ unstakeAmount: Wei; burnAmount: Wei; txLink: string }> = ({
	unstakeAmount,
	burnAmount,
	txLink,
}) => {
	const { t } = useTranslation();

	return (
		<TxState
			description={
				<Label>
					<Trans i18nKey="earn.incentives.options.snx.description" components={[]} />
				</Label>
			}
			title={t('earn.actions.claim.in-progress')}
			content={
				<FlexDivColCentered>
					<Svg src={PendingConfirmation} />
					<StyledFlexDiv>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
							<WhiteSubheader>
								{t('earn.actions.claim.amount', {
									amount: formatNumber(unstakeAmount, {
										minDecimals: DEFAULT_FIAT_DECIMALS,
										maxDecimals: DEFAULT_FIAT_DECIMALS,
									}),
									asset: Synths.sUSD,
								})}
							</WhiteSubheader>
						</StyledFlexDivColCentered>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
							<WhiteSubheader>
								{t('earn.actions.claim.amount', {
									amount: formatNumber(burnAmount, {
										minDecimals: DEFAULT_FIAT_DECIMALS,
										maxDecimals: DEFAULT_FIAT_DECIMALS,
									}),
									asset: CryptoCurrency.SNX,
								})}
							</WhiteSubheader>
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
	unstakeAmount: Wei;
	burnAmount: Wei;
	txLink: string;
	onDismiss: () => void;
}> = ({ unstakeAmount, burnAmount, txLink, onDismiss }) => {
	const { t } = useTranslation();

	return (
		<TxState
			description={
				<Label>
					<Trans
						i18nKey="earn.incentives.options.snx.description"
						components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
					/>
				</Label>
			}
			title={t('earn.actions.claim.success')}
			content={
				<FlexDivColCentered>
					<Svg src={Success} />
					<StyledFlexDiv>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('earn.actions.claim.claimed')}</GreyHeader>
							<WhiteSubheader>
								{t('earn.actions.claim.amount', {
									amount: formatNumber(unstakeAmount, {
										minDecimals: DEFAULT_FIAT_DECIMALS,
										maxDecimals: DEFAULT_FIAT_DECIMALS,
									}),
									asset: Synths.sUSD,
								})}
							</WhiteSubheader>
						</StyledFlexDivColCentered>
						<StyledFlexDivColCentered>
							<GreyHeader>{t('earn.actions.claim.claimed')}</GreyHeader>
							<WhiteSubheader>
								{t('earn.actions.claim.amount', {
									amount: formatNumber(burnAmount, {
										minDecimals: DEFAULT_FIAT_DECIMALS,
										maxDecimals: DEFAULT_FIAT_DECIMALS,
									}),
									asset: CryptoCurrency.SNX,
								})}
							</WhiteSubheader>
						</StyledFlexDivColCentered>
					</StyledFlexDiv>
					<Divider />
					<ButtonSpacer>
						<ExternalLink href={txLink}>
							<VerifyButton>{t('earn.actions.tx.verify')}</VerifyButton>
						</ExternalLink>
						<DismissButton variant="secondary" onClick={onDismiss}>
							{t('earn.actions.tx.dismiss')}
						</DismissButton>
					</ButtonSpacer>
				</FlexDivColCentered>
			}
		/>
	);
};

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
	padding: 20px 30px;
	&:first-child {
		border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	}
`;

const StyledFlexDiv = styled(FlexDiv)`
	margin-bottom: -20px;
`;
