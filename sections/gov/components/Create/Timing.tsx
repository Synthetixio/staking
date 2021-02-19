import React from 'react';
import styled from 'styled-components';
import { Card, DataRow, Subtitle } from '../common';
import DateSelect from 'components/DateSelect';
import { useTranslation } from 'react-i18next';
import { Input } from 'components/Input/Input';

type TimingProps = {
	setStartDate: Function;
	setEndDate: Function;
	setBlock: Function;
	startDate: Date;
	endDate: Date;
	block: number | null;
};

const Timing: React.FC<TimingProps> = ({
	setStartDate,
	setEndDate,
	setBlock,
	startDate,
	endDate,
	block,
}) => {
	const { t } = useTranslation();
	return (
		<StyledCard>
			<DataRow>
				<Subtitle>{t('gov.create.start.date')}</Subtitle>
				<StyledDateSelect
					selected={startDate}
					onChange={(date) => setStartDate(date)}
					onClear={() => setStartDate(null)}
					showClear={false}
					showTimeSelect
					dateFormat="Pp"
				/>
			</DataRow>
			<DataRow>
				<Subtitle>{t('gov.create.end.date')}</Subtitle>
				<StyledDateSelect
					selected={endDate}
					onChange={(date) => setEndDate(date)}
					onClear={() => setEndDate(null)}
					showClear={false}
					showTimeSelect
					dateFormat="Pp"
				/>
			</DataRow>
			<DataRow>
				<Subtitle>{t('gov.create.block')}</Subtitle>
				<BlockInput value={block ?? 0} onChange={(e) => setBlock(e.target.value)} type="number" />
			</DataRow>
		</StyledCard>
	);
};
export default Timing;

const StyledCard = styled(Card)`
	height: 225px;
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

const BlockInput = styled(Input)`
	background-color: ${(props) => props.theme.colors.navy};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.extended};
	width: 100px;
`;

const StyledDateSelect = styled(DateSelect)`
	.react-datepicker-wrapper {
		margin-right: 12px;
	}
	.select-button {
		font-size: 12px;
		font-family: ${(props) => props.theme.fonts.extended};
	}
`;
