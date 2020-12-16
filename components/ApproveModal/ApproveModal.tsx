import styled from 'styled-components';
import { FC } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import LockedIcon from 'assets/svg/app/locked.svg';

import Button from 'components/Button';

type ApproveModalProps = {
	description: string;
	onApprove: () => void;
	isApproving: boolean;
};

const ApproveModal: FC<ApproveModalProps> = ({ description, onApprove, isApproving }) => {
	const { t } = useTranslation();
	return (
		<Modal>
			<Layer>
				<Svg src={LockedIcon} />
				<ModalInfo>{description}</ModalInfo>
				<StyledButton disabled={isApproving} onClick={onApprove} size="lg" variant="primary">
					{t('common.approve.approve-contract')}
				</StyledButton>
			</Layer>
		</Modal>
	);
};

const Modal = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	bottom: 100%;
	opacity: 0.95;
	background: ${(props) => props.theme.colors.black};
`;

const Layer = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
	width: 260px;
	margin: 0 auto;
	align-items: center;
	text-align: center;
	flex-direction: column;
`;

const ModalInfo = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin-top: 0;
`;

const StyledButton = styled(Button)`
	text-transform: uppercase;
	width: 100%;
`;

export default ApproveModal;
