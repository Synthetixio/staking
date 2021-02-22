import { FC } from 'react';
import styled from 'styled-components';

import colors from '../../styles/theme/colors';
import { formatCurrency, formatPercent } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';
import { BRIGHT_COLORS } from './PieChart';

interface CustomLegendProps {
	isShortLegend: boolean;
	payload?: { value: number; payload: { value: number; name: CurrencyKey } }[];
}

const CustomLegend: FC<CustomLegendProps> = ({ payload, isShortLegend }) => {
	if (payload == null) {
		return null;
	}
	const total = payload.reduce((acc, { payload: { value } }) => (acc += value || 0), 0);
	return (
		<CustomLegendContainer isShortLegend={isShortLegend}>
			{payload.map((entry, index) => (
				<CustomLegendItemWrapper key={`item-${index}`}>
					<CustomLegendItemKey index={index}>{entry.value}</CustomLegendItemKey>
					<CustomLegendItemValue>{`${formatCurrency(
						entry.payload.name,
						entry.payload.value
					)} (${formatPercent(entry.payload.value / total || 0, {
						minDecimals: 2,
					})})`}</CustomLegendItemValue>
				</CustomLegendItemWrapper>
			))}
		</CustomLegendContainer>
	);
};

export default CustomLegend;

const CustomLegendContainer = styled.div<{ isShortLegend: boolean }>`
	display: flex;
	flex-direction: column;
	border: 1px solid ${colors.grayBlue};
	width: 80%;
	margin: 0 auto;
	font-family: 'Inter', sans-serif;
	height: ${(props) => (props.isShortLegend ? '100px' : '225px')};
	overflow-y: scroll;
`;

const CustomLegendItemValue = styled.div`
	text-align: center;
	padding: 5px 0;
	width: 50%;
	border: 1px solid ${colors.grayBlue};
	color: ${(props) => props.theme.colors.white};
	font-family: 'Inter', sans-serif;
	font-size: 12px;
	line-height: 16px;
`;

const CustomLegendItemKey = styled(CustomLegendItemValue)<{ index: number }>`
	color: ${(props) => BRIGHT_COLORS[props.index % BRIGHT_COLORS.length]};
	width: 50%;
`;

const CustomLegendItemWrapper = styled.div`
	width: 100%;
	display: flex;
`;
