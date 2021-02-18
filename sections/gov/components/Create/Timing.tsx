import React from 'react';
import styled from 'styled-components';
import { Card, Row, Subtitle } from '../common';
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
		<Card>
			<Row>
				<Subtitle>{t('gov.create.start.date')}</Subtitle>
				<DateSelect
					selected={startDate}
					onChange={(date) => setStartDate(date)}
					onClear={() => setStartDate(null)}
					showClear
					showTimeSelect
					dateFormat="Pp"
				/>
			</Row>
			<Row>
				<Subtitle>{t('gov.create.end.date')}</Subtitle>
				<DateSelect
					selected={endDate}
					onChange={(date) => setEndDate(date)}
					onClear={() => setEndDate(null)}
					showClear
					showTimeSelect
					dateFormat="Pp"
				/>
			</Row>
			<Row>
				<Subtitle>{t('gov.create.block')}</Subtitle>
				<BlockInput value={block ?? 0} onChange={(e) => setBlock(e.target.value)} type="number" />
			</Row>
		</Card>
	);
};
export default Timing;

const BlockInput = styled(Input)``;
