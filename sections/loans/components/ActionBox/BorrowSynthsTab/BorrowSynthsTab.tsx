import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivColCentered } from 'styles/common';
import GasSelector from 'components/GasSelector';

import { DEBT_ASSETS } from 'sections/loans/constants';
import InterestRate from './InterestRate';
import FormButton from './FormButton';
import AssetInput from './AssetInput';

type BorrowSynthsTabProps = {};

const BorrowSynthsTab: React.FC<BorrowSynthsTabProps> = (props) => {
	const [gasLimitEstimate, setGasLimitEstimate] = React.useState<number | null>(null);
	const [gasPrice, setGasPrice] = React.useState<number>(0);

	const [debtAmount, setDebtAmount] = React.useState<string>('');
	const [debtAsset, setDebtAsset] = React.useState<string>('');

	const [collateralAmount, setCollateralAmount] = React.useState<string>('');
	const [collateralAsset, setCollateralAsset] = React.useState<string>('');
	const [collateralAssets, setCollateralAssets] = React.useState<Array<string>>([]);

	const { t } = useTranslation();

	const onSetDebtAsset = React.useCallback(
		(debtAsset: string): void => {
			const collateralAssets =
				debtAsset === 'sETH' ? ['ETH'] : debtAsset === 'sBTC' ? ['renBTC'] : ['ETH', 'renBTC'];
			setCollateralAssets(collateralAssets);
			setCollateralAsset(collateralAssets[0]);
			setDebtAsset(debtAsset);
		},
		[setCollateralAssets, setCollateralAsset, setDebtAsset]
	);

	React.useEffect(() => {
		const debtAsset = DEBT_ASSETS[0];
		onSetDebtAsset(debtAsset);
	}, []);

	return (
		<>
			<Container>
				<AssetInputsContainer>
					<AssetInput
						label="debt"
						asset={debtAsset}
						setAsset={onSetDebtAsset}
						amount={debtAmount}
						setAmount={setDebtAmount}
						assets={DEBT_ASSETS}
					/>
					<AssetInputDivider />
					<AssetInput
						label="collateral"
						asset={collateralAsset}
						setAsset={setCollateralAsset}
						amount={collateralAmount}
						setAmount={setCollateralAmount}
						assets={collateralAssets}
					/>
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

			<FormButton assetName={debtAsset} />
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
