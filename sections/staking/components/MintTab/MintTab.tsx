import React, { FC, useMemo, useState } from 'react';
import { LoadingState } from 'constants/loading';
import { TabContainer } from '../common';
import styled from 'styled-components';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import Select from 'components/Select';
import { useTranslation } from 'react-i18next';
import Input from 'components/Input/Input';
import Button from 'components/Button';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';

type MintTabProps = {
	amountToStake: string;
	setAmountToStake: (amount: string) => void;
	mintLoadingState: LoadingState | null;
	setMintLoadingState: (state: LoadingState | null) => void;
};

export function getMintAmount(issuanceRatio: number, stakeAmount: string, SNXPrice: number) {
	if (!stakeAmount || !issuanceRatio || !SNXPrice) return '0';
	return Number(stakeAmount) * issuanceRatio * SNXPrice;
}

const MintTab: FC<MintTabProps> = ({
	amountToStake,
	setAmountToStake,
	mintLoadingState,
	setMintLoadingState,
}) => {
	const currencyRatesQuery = useCurrencyRatesQuery(['SNX']);
	const debtDataQuery = useGetDebtDataQuery();
	const currencyRates = currencyRatesQuery.data ?? null;
	const debtData = debtDataQuery?.data ?? null;

	const collateral = debtData?.collateral ?? 0;
	const issuanceRatio = debtData?.targetCRatio ?? 0;

	console.log(issuanceRatio);
	const snxRates = currencyRates?.SNX ?? 0;
	const issuableSynths = debtData?.issuableSynths;

	const { t } = useTranslation();
	const stakeTypes = useMemo(
		() => [
			{
				label: 'SNX',
				key: 'SNX',
			},
			{
				label: 'ETH',
				key: 'ETH',
			},
			{
				label: 'BTC',
				key: 'BTC',
			},
		],
		[t]
	);
	const [stakeType, setStakeType] = useState(stakeTypes[0]);

	const handleMint = () => {
		setMintLoadingState(LoadingState.LOADING);
	};

	const handleStakeChange = (value: string) => setAmountToStake(value);

	const handleMaxIssuance = () => setAmountToStake(issuableSynths?.toString() || '');

	return (
		<StyledTabContainer>
			<HeaderBox>
				<p>Stake</p>
				<StyledSelect
					inputId="mint-type-list"
					formatOptionLabel={(option: any) => option.label}
					options={stakeTypes}
					value={stakeType}
					onChange={(option: any) => {
						if (option) {
							setStakeType(option);
						}
					}}
				/>
			</HeaderBox>
			<InputBox>
				<StyledInput
					placeholder="0"
					onChange={(e) => handleStakeChange(e.target.value)}
					value={amountToStake}
				/>
				<StyledButton onClick={handleMaxIssuance} variant="outline">
					Max
				</StyledButton>
			</InputBox>
			<DataContainer>
				<DataRow>
					<RowTitle>{t('staking.actions.mint.info.staking')}</RowTitle>
					<RowValue>
						{amountToStake ? amountToStake : '0'} {stakeType.label}
					</RowValue>
				</DataRow>
				<DataRow>
					<RowTitle>{t('staking.actions.mint.info.minting')}</RowTitle>
					<RowValue>{getMintAmount(issuanceRatio, amountToStake, snxRates)} sUSD</RowValue>
				</DataRow>
			</DataContainer>
			{amountToStake !== '' ? (
				<StyledCTA onClick={handleMint} variant="primary" size="lg" disabled={!!mintLoadingState}>
					{t('staking.actions.mint.action.mint', {
						amountToStake: amountToStake,
						stakeType: stakeType.label,
					})}
				</StyledCTA>
			) : (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{t('staking.actions.mint.action.empty')}
				</StyledCTA>
			)}
		</StyledTabContainer>
	);
};

const StyledTabContainer = styled(TabContainer)`
	justify-content: space-evenly;
`;

const HeaderBox = styled(FlexDivRowCentered)`
	padding: 16px 0px;
	p {
		color: ${(props) => props.theme.colors.white};
		font-size: 16px;
		font-family: ${(props) => props.theme.fonts.condensedBold};
		margin-right: 16px;
	}
`;

const StyledSelect = styled(Select)`
	border: ${(props) => `2px solid ${props.theme.colors.brightBlue}`};
	width: 100px;
	justify-content: center;
	border-radius: 4px;
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);

	.react-select__dropdown-indicator {
		color: ${(props) => props.theme.colors.brightBlue};
		&:hover {
			color: ${(props) => props.theme.colors.brightBlue};
		}
	}
	.react-select__single-value {
		font-size: 16px;
		width: 100%;
	}

	.react-select__option {
		font-size: 16px;
		width: 100%;
	}
`;

const InputBox = styled(FlexDivRow)`
	margin: 16px auto;
	width: 300px;
`;

const StyledInput = styled(Input)`
	font-size: 40px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	width: 75%;
	text-align: center;
	padding-right: 16px;
`;

const StyledButton = styled(Button)`
	color: ${(props) => props.theme.colors.brightBlue};
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border: ${(props) => `1px solid ${props.theme.colors.brightBlue}`};
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	width: 25%;
`;

const DataRow = styled(FlexDivRow)`
	justify-content: space-between;
	margin: 16px 32px;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.linedBlue}`};
`;
const RowTitle = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	color: ${(props) => props.theme.colors.silver};
	text-transform: uppercase;
`;
const RowValue = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
`;
const DataContainer = styled.div`
	width: 100%;
`;
const StyledCTA = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.6);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default MintTab;
