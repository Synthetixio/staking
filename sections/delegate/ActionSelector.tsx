import { FC } from 'react';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { ACTIONS } from 'queries/delegate/types';

type SelectorProps = {
	action: string;
	setAction: Function;
};

const Selector: FC<SelectorProps> = ({ action, setAction }) => {
	const { t } = useTranslation();

	const tipContent = (
		<SelectContainer>
			{ACTIONS.map((actionId) => (
				<StyedButton
					key={actionId}
					variant="solid"
					onClick={() => {
						setAction(actionId);
					}}
					isActive={actionId === action}
				>
					<Text>{t(`common.delegate-actions.actions.${actionId}`)}</Text>
				</StyedButton>
			))}
		</SelectContainer>
	);

	return (
		<Container>
			<Header>{t('common.delegate-actions.header')}</Header>
			<FlexDivRowCentered>
				<Item>
					<Text>{t(`common.delegate-actions.actions.${action}`)}</Text>
				</Item>
				<Tooltip trigger="click" arrow={false} content={tipContent} interactive={true}>
					<StyledEditButton role="button">{t('common.edit')}</StyledEditButton>
				</Tooltip>
			</FlexDivRowCentered>
		</Container>
	);
};

const Container = styled(FlexDivRow)`
	width: 100%;
	justify-content: space-between;
`;

const Header = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

const Text = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const Tooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.navy};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
	}
`;

const SelectContainer = styled.div`
	padding: 16px 0 8px 0;
`;

const StyedButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
	font-size: 12px;
`;

const Item = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

const StyledEditButton = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	padding-left: 5px;
	font-size: 12px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.blue};
	text-transform: uppercase;
`;

export default Selector;
