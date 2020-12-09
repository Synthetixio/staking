import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import Button from 'components/Button';
import { zIndex } from 'constants/ui';
import LockSVG from 'assets/svg/app/lock.svg';
import {
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';

import { Label, StyledLink, StyledButton } from '../../common';
import { CurrencyKey } from 'constants/currency';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';

type ApproveProps = {
	synth: CurrencyKey;
};

const Approve: FC<ApproveProps> = ({ synth }) => {
	const { t } = useTranslation();
	const [txError, setTxError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	return (
		<>
			<OverlayContainer title="">
				<InnerContainer>
					<Svg src={LockSVG} />
					<Label>
						<Trans
							i18nKey="modals.approve.description"
							values={{
								synth,
							}}
							components={[<StyledLink />]}
						/>
						<PaddedButton variant="primary" onClick={() => setTxModalOpen(true)}>
							{t('modals.approve.button')}
						</PaddedButton>
					</Label>
				</InnerContainer>
				{txError && (
					<Actions>
						<Message>{t('common.transaction.error')}</Message>
						<MessageButton onClick={() => console.log('retry')}>
							{t('common.transaction.reattempt')}
						</MessageButton>
					</Actions>
				)}
			</OverlayContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txError}
					attemptRetry={() => console.log('retry')}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.approve.approving')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-transaction.approve.contract', { synth })}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const OverlayContainer = styled(FlexDivColCentered)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	justify-content: space-around;
	position: absolute;
	background-color: rgba(0, 0, 0, 0.8);
	width: 555px;
	height: 370px;
`;

const InnerContainer = styled(FlexDivColCentered)`
	width: 300px;
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.regular};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

const MessageButton = styled(Button).attrs({
	variant: 'primary',
	size: 'lg',
	isRounded: true,
})`
	text-transform: uppercase;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
	width: 100%;
`;

export default Approve;
