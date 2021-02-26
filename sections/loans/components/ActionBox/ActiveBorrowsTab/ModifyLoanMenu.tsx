import React from 'react';
import moment from 'moment';
import { createPortal } from 'react-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { NoTextTransform } from 'styles/common';
import OutsideClickHandler from 'react-outside-click-handler';
import { zIndex } from 'constants/ui';
import { Loan } from 'queries/loans/types';
import { useConfig } from 'sections/loans/hooks/config';
import { Big, toBig } from 'utils/formatters/big-number';
import { LOAN_TYPE_ETH } from 'sections/loans/constants';

const MODAL_WIDTH: number = 105;
const MODAL_TOP_PADDING: number = 15;

type BorrowModifyModalProps = {
	actions: Array<string>;
	loan: Loan;
};

const BorrowModifyModal: React.FC<BorrowModifyModalProps> = ({ actions, loan }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const { interactionDelays } = useConfig();

	const buttonRef = React.useRef<HTMLDivElement>(null);
	const [{ top, left }, setPosition] = React.useState<any>({});
	const [modalContainer, setModalContainer] = React.useState<HTMLElement | null>(null);
	const [waitETA, setWaitETA] = React.useState<string>('');

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

	const nextInteractionDate = React.useMemo(() => {
		if (!(loan.type && interactionDelays && loan.type in interactionDelays)) return;
		const interactionDelay = interactionDelays[loan.type];
		return moment
			.unix(parseInt(loan.lastInteraction.toString()))
			.add(parseInt(interactionDelay.toString()), 'seconds');
	}, [loan.type, loan.lastInteraction, interactionDelays]);

	React.useEffect(() => {
		if (!nextInteractionDate) return;

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

		const timer = () => {
			const intervalId = setInterval(() => {
				const now = moment.utc();
				if (now.isAfter(nextInteractionDate)) {
					return stopTimer();
				}
				if (isMounted) {
					setWaitETA(toHumanizedDuration(toBig(nextInteractionDate.diff(now, 'seconds'))));
				}
			}, 1000);

			const stopTimer = () => {
				if (isMounted) {
					setWaitETA('');
				}
				clearInterval(intervalId);
			};

			unsubs.push(stopTimer);
		};

		timer();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [nextInteractionDate]);

	return (
		<Menu>
			<Button onClick={onOpen} ref={buttonRef}>
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

			{!open || !modalContainer
				? null
				: createPortal(
						<OutsideClickHandler onOutsideClick={onClose}>
							<Container {...{ top, left }}>
								{waitETA ? (
									<WaitETA>
										<Trans
											i18nKey={'loans.modify-loan.loan-interation-delay'}
											values={{ waitETA }}
											components={[<NoTextTransform />]}
										/>
									</WaitETA>
								) : (
									<ul>
										{actions.map((action) => (
											<li key={action} onClick={() => onStartModify(action)}>
												{action}
											</li>
										))}
									</ul>
								)}
							</Container>
						</OutsideClickHandler>,
						modalContainer
				  )}
		</Menu>
	);
};

function toHumanizedDuration(ms: Big) {
	const dur: Record<string, string> = {};
	const units: Array<any> = [
		{ label: 's', mod: 60 },
		{ label: 'm', mod: 60 },
		// { label: 'h', mod: 24 },
		// { label: 'd', mod: 31 },
		// {label: "w", mod: 7},
	];
	units.forEach((u) => {
		const z = (dur[u.label] = ms.mod(u.mod));
		ms = ms.sub(z).div(u.mod);
	});
	return units
		.reverse()
		.filter((u) => {
			return u.label !== 'ms'; // && dur[u.label]
		})
		.map((u) => {
			let val = dur[u.label];
			if (u.label === 'm' || u.label === 's') {
				val = val.toString().padStart(2, '0');
			}
			return val + u.label;
		})
		.join(':');
}

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

const WaitETA = styled.div`
	padding: 8px;
`;

export default BorrowModifyModal;
