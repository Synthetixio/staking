import React, { useState, useEffect, useMemo } from 'react';

import { Grid, Col } from 'sections/gov/components/common';

import Options from './Options';
import Timing from './Timing';
import Question from './Question';
import Connector from 'containers/Connector';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { Transaction } from 'constants/network';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { ethers } from 'ethers';

import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { ModalContent, ModalItem, ModalItemText, ModalItemTitle } from 'styles/common';

import CouncilDilution from 'contracts/councilDilution.js';
import { truncateAddress } from 'utils/formatters/string';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { AxiosResponse } from 'axios';

type IndexProps = {
	onBack: Function;
};

const Index: React.FC<IndexProps> = ({ onBack }) => {
	const { t } = useTranslation();
	const { provider } = Connector.useContainer();
	const { useSnapshotSpaceQuery, useContractTxn } = useSynthetixQueries();

	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date>(new Date(startDate.getTime() + 86400000));
	const [block, setBlock] = useState<number | null>(null);
	const [name, setName] = useState<string>('');
	const [body, setBody] = useState<string>('');
	const [choices, setChoices] = useState<string[]>([]);
	const [result, setResult] = useState<AxiosResponse<any> | null>(null);
	const activeTab = useActiveTab();
	const [signTransactionState, setSignTransactionState] = useState<Transaction>(
		Transaction.PRESUBMIT
	);
	const [txTransactionState, setTxTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [signModalOpen, setSignModalOpen] = useState<boolean>(false);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [signError, setSignError] = useState<string | null>(null);
	const space = useSnapshotSpaceQuery(snapshotEndpoint, activeTab);
	const [ipfsHash, setIpfsHash] = useState<string | null>(null);

	const { signer } = Connector.useContainer();

	const contract = useMemo(
		() => new ethers.Contract(CouncilDilution.address, CouncilDilution.abi, signer as any),
		[signer]
	);

	const txn = useContractTxn(contract, 'logProposal', [ipfsHash], {});

	const sanitiseTimestamp = (timestamp: number) => {
		return Math.round(timestamp / 1e3);
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

	const createProposal = useSignMessage({
		onSuccess: async (response) => {
			setSignModalOpen(false);
			setResult(response);

			let ipfsHash = response?.data.ipfsHash;

			setIpfsHash(ipfsHash);

			if (activeTab === SPACE_KEY.PROPOSAL) {
				txn.mutate();
				setTxModalOpen(true);
				setSignTransactionState(Transaction.PRESUBMIT);
			} else {
				setSignTransactionState(Transaction.SUCCESS);
			}
		},
		onError: async (error) => {
			console.log(error);
			setSignTransactionState(Transaction.PRESUBMIT);
			setSignError(error.message);
		},
	});

	const handleCreate = async () => {
		try {
			if (space.data && block) {
				const isFixed = activeTab === SPACE_KEY.PROPOSAL;
				setSignError(null);

				setSignModalOpen(true);
				setSignTransactionState(Transaction.WAITING);

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

				createProposal.mutate({
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
							plugins: {},
							network: '1',
							strategies: space.data.strategies as any,
						},
						type: 'single-choice',
					},
				});
			}
		} catch (error) {
			console.log(error);
			setSignTransactionState(Transaction.PRESUBMIT);
			setTxTransactionState(Transaction.PRESUBMIT);
			setSignError(error.message);
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
			<Grid>
				<Col>
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
						hash={ipfsHash}
						txHash={txn.hash}
					/>
				</Col>
				<Col>
					<Options choices={choices} setChoices={setChoices} />
					<Timing
						startDate={startDate}
						endDate={endDate}
						setStartDate={setStartDate}
						setEndDate={setEndDate}
						block={block}
						setBlock={setBlock}
					/>
				</Col>
			</Grid>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txn.errorMessage}
					attemptRetry={handleCreate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.propose.title')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-transaction.propose.hash', {
										hash: truncateAddress(ipfsHash ?? ''),
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
