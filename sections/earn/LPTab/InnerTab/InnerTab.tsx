import { FC, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { StyledInput } from 'components/Input/NumericInput';
import { FlexDivColCentered, FlexDivCentered } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';

import { TotalValueWrapper, Subtext, Value, StyledButton } from '../../common';

import { Staking } from '../LPTab';
import { CurrencyKey } from 'constants/currency';

interface InnerTabProps {
	icon: () => JSX.Element;
	setAmount: Dispatch<SetStateAction<number | null>>;
	handleStake: (type: Staking) => void;
	isStake: boolean;
	asset: CurrencyKey;
	assetAmount: number;
}

const InnerTab: FC<InnerTabProps> = ({
	icon,
	asset,
	handleStake,
	setAmount,
	isStake,
	assetAmount,
}) => {
	const { t } = useTranslation();
	return (
		<Container>
			<div>{icon()}</div>
			<InputSection>
				<EmptyDiv />
				<InputField placeholder="0.00" onChange={(e) => setAmount(Number(e.target.value))} />
				<MaxButton
					variant="primary"
					disabled={assetAmount === 0}
					onClick={() => setAmount(assetAmount)}
				>
					{t('earn.actions.max')}
				</MaxButton>
			</InputSection>
			<TotalValueWrapper>
				<Subtext>{t('earn.actions.available')}</Subtext>
				<StyledValue>{formatCryptoCurrency(assetAmount, { currencyKey: asset })}</StyledValue>
			</TotalValueWrapper>
			<PaddedButton
				variant="primary"
				onClick={() => handleStake(isStake ? Staking.STAKE : Staking.UNSTAKE)}
				disabled={true}
			>
				{isStake
					? t('earn.actions.stake.stake-button', { asset })
					: t('earn.actions.unstake.unstake-button', { asset })}
			</PaddedButton>
		</Container>
	);
};

const Container = styled(FlexDivColCentered)`
	background-color: ${(props) => props.theme.colors.black};
	height: 100%;
	width: 100%;
`;

const StyledValue = styled(Value)`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 12px;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
	width: 80%;
`;

const MaxButton = styled(StyledButton)`
	width: 25%;
	font-size: 14px;
	height: 30px;
`;

const InputSection = styled(FlexDivCentered)`
	justify-content: space-between;
	width: 80%;
`;

const EmptyDiv = styled.div`
	width: 25%;
`;

const InputField = styled(StyledInput)`
	width: 50%;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.expanded};
	text-align: center;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

export default InnerTab;
