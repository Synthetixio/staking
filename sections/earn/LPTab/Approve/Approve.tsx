import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import Button from 'components/Button';
import { zIndex } from 'constants/ui';
import { FlexDivColCentered } from 'styles/common';
import LockSVG from 'assets/svg/app/lock.svg';

import { Label, StyledLink, StyledButton } from '../../common';
import { CurrencyKey } from 'constants/currency';

type ApproveProps = {
	synth: CurrencyKey;
};

const Approve: FC<ApproveProps> = ({ synth }) => {
	const { t } = useTranslation();
	const [txError, setTxError] = useState<boolean>(false);

	return (
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
					<PaddedButton variant="primary" onClick={() => console.log('set allowance')}>
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
	);
};

const OverlayContainer = styled(FlexDivColCentered)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	justify-content: space-around;
	position: absolute;
	background-color: rgba(0, 0, 0, 0.8);
	width: 530px;
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
