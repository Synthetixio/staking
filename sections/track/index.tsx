import { FC } from 'react';
import styled from 'styled-components';
import TrackChart from './TrackChart';
import TrackIcon from 'assets/svg/app/track.svg';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { FlexDivCentered } from 'styles/common';

import { LineSpacer } from 'styles/common';
import SynthsTable from './SynthsTable';

export const formatCurrencyWithSign = (sign, value, decimals = 2) =>
	`${sign}${value.toFixed(decimals)}`;

const Track: FC = (props) => {
	const { t } = useTranslation();

	return (
		<div>
			<Header>
				<Svg src={TrackIcon} width="64" />
				<StyledH1>{t('track.title')}</StyledH1>
				<div>
					{t('track.subtitle')}
					<StyledExternalLink href="https://www.zapper.fi/"> Zapper.fi ↗</StyledExternalLink>
				</div>
			</Header>
			<LineSpacer />

			<Grid>
				<Stats>
					<SingleStat>
						<StatTitle>{t('track.data.issuedDebt')}</StatTitle>
						<Amount>{'$' + props.mintAndBurnDebtValue.toFixed(2)}</Amount>
					</SingleStat>
					<SingleStat>
						<StatTitle>{t('track.data.actualDebt')}</StatTitle>
						<Amount>{'$' + props.actualDebtValue.toFixed(2)}</Amount>
					</SingleStat>
					<SingleStat>
						<StatTitle>{t('track.data.totalSynths')}</StatTitle>
						<Amount>{'$' + props.totalSynthsValue.toFixed(2)}</Amount>
					</SingleStat>
				</Stats>
				<Chart>
					<TrackChart data={props.data} />
				</Chart>
			</Grid>
			<TableBorderedContainer>
				<SynthsTable
					data={(props.allSynthsData && props.allSynthsData.balances) || []}
					columns={[
						{
							Header: t('track.table.yourSynths'),
							accessor: 'currencyKey',
							Cell: ({ value }) => {
								return (
									<FlexDivCentered>
										<CurrencyIcon src={`/images/currencies/${value}.svg`} />
										{t(value)}
									</FlexDivCentered>
								);
							},
							sortable: false,
						},
						{
							Header: t('track.table.balance'),
							accessor: 'balance',
							Cell: ({ value }) => {
								return `${value.toFixed(2)}`;
							},
							sortable: true,
						},
						{
							Header: '$ USD',
							accessor: 'usdBalance',
							Cell: ({ value }) => {
								return `${formatCurrencyWithSign('$', value)}`;
							},
							sortable: true,
						},
					]}
				/>
			</TableBorderedContainer>
		</div>
	);
};

export const BorderedContainer = styled.div`
	padding: 18px;
	white-space: nowrap;
	border: 1px solid ${(props) => props.theme.colors.gray};
	border-radius: 2px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const Header = styled.div`
	text-align: center;
	margin-bottom: 2rem;
`;
const CurrencyIcon = styled.img`
	width: 22px;
	height: 22px;
	margin-right: 5px;
`;
const Chart = styled.div`
	padding: 18px;
	white-space: nowrap;
	border: 1px solid ${(props) => props.theme.colors.gray};
	border-radius: 2px;
`;
const Stats = styled.div`
	display: grid;
	grid-row-gap: 18px;
`;
const StatTitle = styled.h5`
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.yellow};
	font-family: ${(props) => props.theme.fonts.regular};
	margin: 0;
`;
const Amount = styled.h3``;
const SingleStat = styled(BorderedContainer)``;

const TableBorderedContainer = styled(BorderedContainer)`
	margin-top: 18px;
	height: 248px;
`;
const Grid = styled.div`
	display: grid;
	width: 100%;
	grid-template-columns: 200px 1fr;
	grid-column-gap: 18px;
`;
const StyledH1 = styled.h1`
	margin: 18px 0 8px 0;
`;

const StyledExternalLink = styled.a`
	color: ${(props) => props.theme.colors.blue};
`;

export default Track;
