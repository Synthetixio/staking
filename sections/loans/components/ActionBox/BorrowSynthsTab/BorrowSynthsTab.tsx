import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivColCentered } from 'styles/common';
import GasSelector from 'components/GasSelector';

import InterestRate from './InterestRate';
import FormButton from './FormButton';
import AssetInput from './AssetInput';

type BorrowSynthsTabProps = {};

const BorrowSynthsTab: React.FC<BorrowSynthsTabProps> = (props) => {
	const [gasLimitEstimate, setGasLimitEstimate] = React.useState<number | null>(null);
	const [gasPrice, setGasPrice] = React.useState<number>(0);

	const { t } = useTranslation();

	return (
		<>
			<Container>
				<AssetInputsContainer>
					<AssetInput label="debt" />
					<AssetInputDivider />
					<AssetInput label="collateral" />
				</AssetInputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<InterestRate />
					</SettingContainer>
					<SettingContainer>
						<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</Container>

			<FormButton />
		</>
	);
};

//

export const Container = styled(FlexDivColCentered)`
	justify-content: space-between;
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
`;

const AssetInputsContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1px 1fr;
	align-items: center;
`;

const AssetInputDivider = styled.div`
	background: #161b44;
	height: 92px;
	width: 1px;
`;

const SettingsContainer = styled.div`
	width: 100%;
	margin-bottom: 16px;
`;

const SettingContainer = styled.div`
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
`;

export default BorrowSynthsTab;
