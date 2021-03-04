import React, { useState, useEffect, useMemo } from 'react';

import { LeftCol, RightCol } from 'sections/gov/components/common';

import { Row } from 'styles/common';
import Options from './Options';
import Timing from './Timing';
import Question from './Question';
import Connector from 'containers/Connector';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import useSnapshotSpace from 'queries/gov/useSnapshotSpace';
import { Transaction } from 'constants/network';
import { SPACE_KEY } from 'constants/snapshot';
import { ethers } from 'ethers';

import CouncilDilution from 'contracts/councilDilution.js';

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
	const [signTransactionState, setSignTransactionState] = useState<Transaction>(
		Transaction.PRESUBMIT
	);
	const [txTransactionState, setTxTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [signModalOpen, setSignModalOpen] = useState<boolean>(false);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [signError, setSignError] = useState<string | null>(null);
	const [txError, setTxError] = useState<string | null>(null);
	const space = useSnapshotSpace(activeTab);
	const [createProposal, result] = useSignMessage();

	// @TODO: change to L2 signer
	const { signer } = Connector.useContainer();

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
			if (space.data && block) {
				setTxError(null);
				setSignError(null);
				setSignModalOpen(true);
				setSignTransactionState(Transaction.WAITING);
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
				})
					.then((response) => {
						setSignModalOpen(false);

						console.log(response);

						if (activeTab === SPACE_KEY.PROPOSAL) {
							setTxTransactionState(Transaction.PRESUBMIT);

							const contract = new ethers.Contract(
								CouncilDilution.address,
								CouncilDilution.abi,
								signer as any
							);

							setTxModalOpen(true);
							setTxTransactionState(Transaction.WAITING);

							const tx = contract.logProposal(
								response?.data.ipfs,
								sanitiseTimestamp(startDate.getTime())
							);

							if (tx) {
								setTxModalOpen(false);
								setTxTransactionState(Transaction.SUCCESS);
							}
						} else {
							setSignTransactionState(Transaction.SUCCESS);
						}
					})
					.catch((error) => {
						console.log(error);
						setSignTransactionState(Transaction.PRESUBMIT);
						setSignError(error.message);
					});
			}
		} catch (e) {
			console.log(e);
			setSignTransactionState(Transaction.PRESUBMIT);
			setTxTransactionState(Transaction.PRESUBMIT);
			setSignError(e.message);
			setTxError(e.message);
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
					result={result}
					validSubmission={validSubmission}
					signTransactionState={signTransactionState}
					txTransactionState={txTransactionState}
					signModalOpen={signModalOpen}
					txModalOpen={txModalOpen}
					signError={signError}
					txError={txError}
					setTxModalOpen={setTxModalOpen}
					setSignModalOpen={setSignModalOpen}
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
