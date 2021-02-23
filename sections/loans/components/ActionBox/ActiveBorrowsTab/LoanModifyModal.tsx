import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';
import { zIndex } from 'constants/ui';

import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Repay from './Repay';
import Draw from './Draw';
import Close from './Close';

const ACTIONS: Record<string, any> = {
	DEPOSIT: Deposit,
	WITHDRAW: Withdraw,
	DRAW: Draw,
	REPAY: Repay,
	CLOSE: Close,
};

const ACTION_NAMES: Array<string> = Object.keys(ACTIONS);

type BorrowModifyModalProps = {};

export const BorrowModifyModal: React.FC<BorrowModifyModalProps> = () => {
	const { t } = useTranslation();
	const [open, setOpen] = React.useState(false);

	const onOpen = () => setOpen(true);
	const onClose = () => setOpen(false);

	return (
		<Menu>
			<Button onClick={onOpen}>
				ACTIONS{' '}
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3.705 4.14746L6 6.43746L8.295 4.14746L9 4.85246L6 7.85246L3 4.85246L3.705 4.14746Z"
						fill="#42DDFF"
					/>
				</svg>
			</Button>

			{!open ? null : (
				<OutsideClickHandler onOutsideClick={onClose}>
					<Container>
						<ul>
							{ACTION_NAMES.map((action) => (
								<li key={action} onClick={onClose}>
									{action}
								</li>
							))}
						</ul>
					</Container>
				</OutsideClickHandler>
			)}
		</Menu>
	);
};

const Menu = styled.div`
	position: relative;
`;

const Button = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	color: ${(props) => props.theme.colors.blue};
	cursor: pointer;
`;

const Container = styled.div`
	position: absolute;
	right: -15px;
	width: 105px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	z-index: ${zIndex.DROPDOWN};
	margin-top: 2px;
	background: ${(props) => props.theme.colors.mediumBlue};
	border: 1px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;

	li {
		padding: 10px 20px;
		cursor: pointer;

		&:hover {
			opacity: 0.7;
		}
	}
`;

export default BorrowModifyModal;
