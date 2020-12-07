import { FC, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
// import { Svg } from 'react-optimized-image';

import { StyledInput } from 'sections/staking/components/common';
import { FlexDivColCentered } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';

import { TotalValueWrapper, Subtext, Value, StyledButton } from '../../common';

import { Staking } from '../LPTab';
import { CurrencyKey } from 'constants/currency';

interface InnerTabProps {
	setAmount: Dispatch<SetStateAction<number | null>>;
	handleStake: (type: Staking) => void;
	isStake: boolean;
	icon: ImgSrc;
	asset: CurrencyKey;
	inputAmount: number | null;
	assetAmount: number;
}

const InnerTab: FC<InnerTabProps> = ({
	icon,
	asset,
	handleStake,
	inputAmount,
	setAmount,
	isStake,
	assetAmount,
}) => {
	const { t } = useTranslation();
	return (
		<FlexDivColCentered>
			{/* <Svg src={icon} /> */}
			<StyledInput placeholder={0} onChange={(e) => setAmount(Number(e.target.value))} />
			<TotalValueWrapper>
				<Subtext>{t('earn.actions.available')}</Subtext>
				<Value>{formatCryptoCurrency(assetAmount, { currencyKey: asset })}</Value>
			</TotalValueWrapper>
			<StyledButton
				variant="primary"
				onClick={() => handleStake(isStake ? Staking.STAKE : Staking.UNSTAKE)}
				disabled={status != null}
			>
				{isStake
					? t('earn.actions.stake.stake-button', { asset })
					: t('earn.actions.unstake.unstake-button', { asset })}
			</StyledButton>
		</FlexDivColCentered>
	);
};

const InnerTabContainer = styled(FlexDivColCentered)``;

export default InnerTab;
