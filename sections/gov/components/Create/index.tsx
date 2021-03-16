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

import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { ModalContent, ModalItem, ModalItemText, ModalItemTitle } from 'styles/common';

import CouncilDilution from 'contracts/councilDilution.js';
import TransactionNotifier from 'containers/TransactionNotifier';
import { truncateAddress } from 'utils/formatters/string';
import { useTranslation } from 'react-i18next';
import { getGasEstimateForTransaction } from 'utils/transactions';

type IndexProps = {
	onBack: Function;
};

const Index: React.FC<IndexProps> = ({ onBack }) => {
	const { t } = useTranslation();
	const { provider } = Connector.useContainer();
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>(new Date(startDate.getTime() + 86400000));
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
	const [txHash, setTxHash] = useState<string | null>(null);
	const space = useSnapshotSpace(activeTab);
	const [createProposal, result] = useSignMessage();
	const [hash, setHash] = useState<string | null>(null);
	const { monitorTransaction } = TransactionNotifier.useContainer();

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

	const handleCreate = async () => {
		try {
			if (space.data && block) {
				const isFixed = activeTab === SPACE_KEY.PROPOSAL;

				setTxError(null);
				setSignError(null);

				setSignModalOpen(true);
				setSignTransactionState(Transaction.WAITING);

				const contract = new ethers.Contract(
					CouncilDilution.address,
					CouncilDilution.abi,
					signer as any
				);

				let proposalStartDate;
				let proposalEndDate;

				if (isFixed) {
					const proposalPeriod = await contract.proposalPeriod();
					proposalStartDate = Math.round(new Date().getTime() / 1000);
					proposalEndDate = proposalStartDate + proposalPeriod.toNumber();
				} else {
					proposalStartDate = sanitiseTimestamp(startDate.getTime());
					proposalEndDate = sanitiseTimestamp(endDate.getTime());
				}

				createProposal({
					spaceKey: activeTab,
					type: SignatureType.PROPOSAL,
					payload: {
						name,
						body,
						choices,
						start: proposalStartDate,
						end: proposalEndDate,
						snapshot: block,
						metadata: {
							strategies: space.data.strategies as any,
						},
					},
				})
					.then(async (response) => {
						setSignModalOpen(false);

						let ipfsHash = response?.data.ipfsHash;

						setHash(ipfsHash);

						if (activeTab === SPACE_KEY.PROPOSAL) {
							try {
								setSignTransactionState(Transaction.PRESUBMIT);
								setTxTransactionState(Transaction.PRESUBMIT);
								setTxModalOpen(true);

								const gasLimit = await getGasEstimateForTransaction(
									[ipfsHash],
									contract.estimateGas.logProposal
								);

								const transaction = await contract.logProposal(ipfsHash, { gasLimit });

								if (transaction) {
									setTxHash(transaction.hash);
									setTxTransactionState(Transaction.WAITING);
									monitorTransaction({
										txHash: transaction.hash,
										onTxConfirmed: () => setTxTransactionState(Transaction.SUCCESS),
									});
									setTxModalOpen(false);
								}
							} catch (error) {
								console.log(error);
								setTxTransactionState(Transaction.PRESUBMIT);
								setTxError(error);
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
		} catch (error) {
			console.log(error);
			setSignTransactionState(Transaction.PRESUBMIT);
			setTxTransactionState(Transaction.PRESUBMIT);
			setSignError(error.message);
			setTxError(error.message);
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
		<>
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
						setSignTransactionState={setSignTransactionState}
						setTxTransactionState={setTxTransactionState}
						txTransactionState={txTransactionState}
						hash={hash}
						txHash={txHash}
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
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txError}
					attemptRetry={handleCreate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.propose.title')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-transaction.propose.hash', {
										hash: truncateAddress(hash ?? ''),
									})}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
			{signModalOpen && (
				<TxConfirmationModal
					isSignature={true}
					onDismiss={() => setSignModalOpen(false)}
					txError={signError}
					attemptRetry={handleCreate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-signature.propose.title')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-signature.propose.space', {
										space: activeTab,
									})}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};
export default Index;
