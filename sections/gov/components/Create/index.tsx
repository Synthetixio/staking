import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LeftCol, RightCol } from 'sections/gov/components/common';

import { Row } from 'styles/common';
import Options from './Options';
import Timing from './Timing';
import Question from './Question';
import Connector from 'containers/Connector';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import useSnapshotSpace from 'queries/gov/useSnapshotSpace';

type IndexProps = {
	onBack: Function;
};

const Index: React.FC<IndexProps> = ({ onBack }) => {
	const { provider } = Connector.useContainer();
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>(new Date());
	const [block, setBlock] = useState<number | null>(null);
	const [name, setName] = useState<string>('');
	const [body, setBody] = useState<string>('');
	const [choices, setChoices] = useState<string[]>([]);
	const activeTab = useActiveTab();

	const space = useSnapshotSpace(activeTab, true);
	const [createProposal, response] = useSignMessage();

	const sanitiseTimestamp = (timestamp: number) => {
		return timestamp / 1e3;
	};

	const validSubmission = useMemo(() => {
		if (
			name.length > 0 &&
			body.length > 0 &&
			block &&
			sanitiseTimestamp(endDate.getTime()) > 0 &&
			sanitiseTimestamp(startDate.getTime()) > 0 &&
			choices.length > 0
		) {
			return true;
		} else {
			return false;
		}
	}, [name, body, block, endDate, startDate, choices]);

	const handleCreate = () => {
		try {
			console.log(startDate.getTime());
			console.log(space.data?.strategies);
			console.log(choices);

			if (validSubmission && space.data && block) {
				createProposal({
					spaceKey: activeTab,
					type: SignatureType.PROPOSAL,
					payload: {
						name,
						body,
						choices,
						start: sanitiseTimestamp(startDate.getTime()),
						end: sanitiseTimestamp(endDate.getTime()),
						snapshot: block,
						metadata: {
							strategies: space.data.strategies as any,
						},
					},
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		const getCurrentBlock = async () => {
			if (provider) {
				let blockNumber = await provider?.getBlockNumber();
				if (blockNumber) {
					setBlock(blockNumber);
				}
			}
		};

		getCurrentBlock();
	}, [provider]);

	return (
		<Row>
			<LeftCol>
				<Question
					onBack={onBack}
					body={body}
					name={name}
					setBody={setBody}
					setName={setName}
					handleCreate={handleCreate}
				/>
			</LeftCol>
			<RightCol>
				<Options choices={choices} setChoices={setChoices} />
				<Timing
					startDate={startDate}
					endDate={endDate}
					setStartDate={setStartDate}
					setEndDate={setEndDate}
					block={block}
					setBlock={setBlock}
				/>
			</RightCol>
		</Row>
	);
};
export default Index;
