import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { FlexDivColCentered } from 'styles/common';
import SNXLogo from 'assets/svg/currencies/crypto/SNX.svg';
import { TabContainer } from '../common';

import { CryptoCurrency } from 'constants/currency';
import { formatCryptoCurrency } from 'utils/formatters/number';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import GasSelector from 'components/GasSelector';
import Button from 'components/Button';
import ApproveModal from 'components/ApproveModal';

const SNX_DECIMALS = 2;

const DepositPanel = () => {
	const { t } = useTranslation();
	const depositCurrencyKey = CryptoCurrency['SNX'];
	const { transferableCollateral } = useStakingCalculations();

	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	console.log(gasPrice, setGasLimitEstimate);

	return (
		<TabContainer>
			<ApproveModal
				description={t('layer2.actions.deposit.action.approve.description')}
				isApproving={false}
				onApprove={() => console.log('TODO')}
			/>
			<InfoContainer>
				<Svg src={SNXLogo} />
				<Data>
					{formatCryptoCurrency(transferableCollateral, {
						decimals: SNX_DECIMALS,
						currencyKey: depositCurrencyKey,
					})}
				</Data>
			</InfoContainer>

			<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
			<StyledButton variant="primary" size="lg">
				{t('layer2.actions.deposit.action.deposit')}
			</StyledButton>
		</TabContainer>
	);
};

const InfoContainer = styled(FlexDivColCentered)``;

const Data = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 24px;
`;

const StyledButton = styled(Button)`
	width: 100%;
	text-transform: uppercase;
	&:disabled {
		box-shadow: none;
	}
`;

export default DepositPanel;
