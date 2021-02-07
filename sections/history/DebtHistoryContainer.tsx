import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import orderBy from 'lodash/orderBy';
import last from 'lodash/last';
import { ExternalLink,  FlexDivCentered } from 'styles/common';
import DebtChart from './DebtChart';
import numbro from 'numbro';
import { isWalletConnectedState } from 'store/wallet';
import Connector from 'containers/Connector';
import {
	DebtHistoryContainerProps
} from './types';
/*
import { Svg } from 'react-optimized-image';
import TrackIcon from 'assets/svg/app/track.svg';
import { GlowingCircle } from 'styles/common';
*/

//needed to pull these old formatters from Mintr
export const formatCurrency = (value:number, decimals:number = 2) => {
	if (!value) return 0;
	if (!Number(value)) return 0;
	return numbro(value).format('0,0.' + '0'.repeat(decimals));
};

export const formatCurrencyWithSign = (sign:string, value:number, decimals:number = 2) =>
	`${sign}${formatCurrency(value, decimals)}`;

export type HistoricalDebtAndIssuance = {
	timestamp: number;
	actualDebt: number;
	issuanceDebt: number;
}

const DebtHistoryContainer: FC<DebtHistoryContainerProps> = ({
	issued,
	burned,
	debtHistory,
	currentDebt,
	totalSynthUSD,
	sUSDRate,
	isLoaded,
}) => {
	const { t } = useTranslation();

	const burnEventsMap = burned.map(event => {
		return { ...event, type: 'burn' };
	});

	const issuedEventsMap = issued.map(event => {
		return { ...event, type: 'issued' };
	});

	// We concat both the events and order them (asc)
	const eventBlocks = orderBy(burnEventsMap.concat(issuedEventsMap), 'block', 'asc');

	// We set historicalIssuanceAggregation array, to store all the cumulative
	// values of every mint and burns
	const historicalIssuanceAggregation:Array<number> = [];
	eventBlocks.forEach((event, i) => {
		const multiplier = event.type === 'burn' ? -1 : 1;
		const aggregation =
			historicalIssuanceAggregation.length === 0
				? multiplier * event.value
				: multiplier * event.value + historicalIssuanceAggregation[i - 1];

		historicalIssuanceAggregation.push(aggregation);
	});

	// We merge both actual & issuance debt into an array
	let historicalDebtAndIssuance:Array<HistoricalDebtAndIssuance> = [];
	for (let i=0; i<debtHistory.length; i++)
	{
		let debtSnapshot = debtHistory[debtHistory.length-i-1];
		historicalDebtAndIssuance.push({
			timestamp: debtSnapshot.timestamp,
			issuanceDebt: historicalIssuanceAggregation[i],
			actualDebt: debtSnapshot.debtBalanceOf,
		});
	}

	// Last occurrence is the current state of the debt
	// Issuance debt = last occurrence of the historicalDebtAndIssuance array
	historicalDebtAndIssuance.push({
		timestamp: new Date().getTime(),
		actualDebt: currentDebt,
		issuanceDebt: last(historicalIssuanceAggregation) ?? 0,
	});

	let debtData = {
		mintAndBurnDebt: last(historicalIssuanceAggregation) ?? 0,
		actualDebt: currentDebt,
	};

	let hmmRate = 1; //seems like these values may already be USD..?
	const mintAndBurnDebtValue = debtData.mintAndBurnDebt * hmmRate; //*sUSDRate
	const actualDebtValue = debtData.actualDebt * hmmRate; //*sUSDRate

	return (
		<>
			<Header>
				{/*
				<GlowingCircle variant="purple" size="md">
					<Svg src={TrackIcon} />
				</GlowingCircle>
				*/}
				<StyledH1>{t('debt-history.chart.title')}</StyledH1>
			</Header>
			<Body>
				<Grid>
					<GridColumn>
						<BorderedContainer>
							<StyledSubtext>{t('debt-history.chart.data.issuedDebt')}</StyledSubtext>
							<Amount>{formatCurrencyWithSign('$', mintAndBurnDebtValue)}</Amount>
						</BorderedContainer>
						<BorderedContainer>
							<StyledSubtext>{t('debt-history.chart.data.actualDebt')}</StyledSubtext>
							<Amount>{formatCurrencyWithSign('$', actualDebtValue)}</Amount>
						</BorderedContainer>
						<BorderedContainer>
							<StyledSubtext>{t('debt-history.chart.data.totalSynths')}</StyledSubtext>
							<Amount>{formatCurrencyWithSign('$', totalSynthUSD)}</Amount>
						</BorderedContainer>
					</GridColumn>
					<GridColumn>
						<ChartBorderedContainer>
							<FlexDivCentered>
								<StyledSubtext>{t('debt-history.chart.subtitle')}</StyledSubtext>
							</FlexDivCentered>
							<DebtChart data={isLoaded?historicalDebtAndIssuance:[]} />
						</ChartBorderedContainer>
					</GridColumn>
				</Grid>
			</Body>
		</>
	)
};

const Header = styled.div``;
const Body = styled.div`
	width: 100%;
`;

const ActionImage = styled.svg`
	height: 48px;
	width: 48px;
`;

const StyledH1 = styled.h1`
	margin: 18px 0 8px 0;
`;

const PLarge = styled.p``;

const StyledExternalLink = styled(ExternalLink)`
	color: ${props => props.theme.colors.blue};
`;

const LinkArrow = styled.span`
	font-size: 10px;
`;

const Grid = styled.div`
	display: grid;
	width: 100%;
	grid-template-columns: 170px 1fr;
	grid-column-gap: 18px;
`;

const GridColumn = styled.div`
	display: grid;
	grid-row-gap: 18px;
`;

export const BorderedContainer = styled.div`
	padding: 18px;
	white-space: nowrap;
	border: 1px solid ${props => props.theme.colors.blue};
	border-radius: 2px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const ChartBorderedContainer = styled(BorderedContainer)`
	justify-content: flex-start;
	align-items: flex-start;
`;

const TableBorderedContainer = styled(BorderedContainer)`
	margin-top: 18px;
	height: 248px;
`;

const StyledSubtext = styled.span`
	text-transform: uppercase;
	color: ${props => props.theme.colors.white};
	margin: 0;
`;

const Amount = styled.span`
	color: ${props => props.theme.colors.blue};
	font-size: 18px;
	margin-top: 4px;
`;

export default DebtHistoryContainer;
