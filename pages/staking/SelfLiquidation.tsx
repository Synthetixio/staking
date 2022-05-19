import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import Button from 'components/Button';
import { EXTERNAL_LINKS } from 'constants/links';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { delegateWalletState, walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import {
	ExternalLink,
	LineSpacer,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { formatPercent } from 'utils/formatters/number';
import { Svg } from 'react-optimized-image';
import WarningIcon from 'assets/svg/app/warning.svg';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

const SelfLiquidation: React.FC<{ percentageTargetCRatio: Wei }> = ({ percentageTargetCRatio }) => {
	const { t } = useTranslation();
	const { useGetLiquidationDataQuery, useSynthetixTxn } = useSynthetixQueries();
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const addressToUse = delegateWallet?.address || walletAddress!;

	const liquidationData = useGetLiquidationDataQuery(addressToUse);
	const liquidationDeadlineForAccount =
		liquidationData?.data?.liquidationDeadlineForAccount ?? wei(0);

	const txn = useSynthetixTxn('Synthetix', 'liquidateSelf');
	// You cant self liquidate with delegation
	if (delegateWallet?.address) return null;
	// You have not been flagged
	if (liquidationDeadlineForAccount.eq(0)) return null;
	return (
		<>
			<Container>
				<Svg src={WarningIcon} />
				<Title>{t('staking.flag-warning.title')}</Title>
				<InfoText>
					<Trans
						i18nKey={'staking.flag-warning.info'}
						components={[
							<Strong />,
							<StyledExternalLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations} />,
						]}
						values={{
							deadlineDate: formatShortDateWithTime(
								liquidationDeadlineForAccount.toNumber() * 1000
							),
							percentageTargetCRatio: formatPercent(percentageTargetCRatio),
						}}
					/>
				</InfoText>
				<StyledButton
					variant={'primary'}
					onClick={() => {
						setTxModalOpen(true);
						txn.mutate();
					}}
				>
					{t('staking.flag-warning.self-liquidate')}
				</StyledButton>
				<LineSpacer />
			</Container>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txn.errorMessage}
					attemptRetry={txn.mutate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle> {t('staking.flag-warning.self-liquidating')}</ModalItemTitle>
								<ModalItemText>{walletAddress}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const StyledButton = styled(Button)`
	margin-bottom: 30px;
`;

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.condensedBold};
`;
const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.blue};
`;
const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;
const InfoText = styled.p`
	max-width: 640px;
	font-size: 14px;
`;
const Title = styled.h3`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 16px;
	margin: 8px 24px;
`;

export default SelfLiquidation;
