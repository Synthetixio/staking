import React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import OutsideClickHandler from 'react-outside-click-handler';
import { zIndex } from 'constants/ui';
import { Loan } from 'queries/loans/types';
import { LOAN_TYPE_ETH } from 'sections/loans/constants';

const MODAL_WIDTH: number = 105;
const MODAL_TOP_PADDING: number = 15;

type BorrowModifyModalProps = {
	actions: Array<string>;
	loan: Loan;
};

const BorrowModifyModal: React.FC<BorrowModifyModalProps> = ({ actions, loan }) => {
	const router = useRouter();
	const { t } = useTranslation();

	const buttonRef = React.useRef<HTMLDivElement>(null);
	const [{ top, left }, setPosition] = React.useState<any>({});
	const [modalContainer, setModalContainer] = React.useState<HTMLElement | null>(null);

	const open = top && left;

	const onOpen = () => {
		const el: HTMLElement = buttonRef.current!;
		const elRect = el.getBoundingClientRect();
		const left = elRect.left - window.scrollX - 20;
		const top = elRect.top + window.scrollY + MODAL_TOP_PADDING;
		setPosition({ top, left });
	};
	const onClose = () => setPosition({});

	const onStartModify = (action: string) => {
		router.push(`/loans/${loan.type === LOAN_TYPE_ETH ? 'eth' : 'erc20'}/${loan.id}/${action}`);
	};

	React.useEffect(() => {
		if (typeof window !== 'undefined') {
			setModalContainer(document.getElementById('modal-container'));
		}
	}, []);

	return (
		<Menu>
			<Button onClick={onOpen} ref={buttonRef}>
				{t('loans.tabs.list.actions-menu-label')}{' '}
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

			{!open || !modalContainer
				? null
				: createPortal(
						<OutsideClickHandler onOutsideClick={onClose}>
							<Container {...{ top, left }}>
								<ul>
									{actions.map((action) => (
										<li key={action} onClick={() => onStartModify(action)}>
											{action}
										</li>
									))}
								</ul>
							</Container>
						</OutsideClickHandler>,
						modalContainer
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
	text-transform: uppercase;
`;

const Container = styled.div<{
	top: number;
	left: number;
}>`
	position: absolute;
	top: ${(props) => props.top}px;
	left: ${(props) => props.left}px;
	width: ${MODAL_WIDTH}px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	z-index: ${zIndex.DROPDOWN};
	margin-top: 2px;
	background: ${(props) => props.theme.colors.mediumBlue};
	border: 1px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	font-size: 12px;
	padding: 10px 0;

	li {
		padding: 10px 20px;
		cursor: pointer;
		text-transform: uppercase;

		&:hover {
			opacity: 0.7;
		}
	}
`;

export default BorrowModifyModal;
