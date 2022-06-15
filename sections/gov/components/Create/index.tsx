import React, { useState, useEffect, useMemo } from 'react';

import { Grid, Col } from 'sections/gov/components/common';

import Options from './Options';
import Timing from './Timing';
import Question from './Question';
import Connector from 'containers/Connector';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
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
import { isL2State } from 'store/wallet';
import { useRecoilValue } from 'recoil';

type IndexProps = {
	onBack: Function;
};

const Index: React.FC<IndexProps> = ({ onBack }) => {
	const { t } = useTranslation();
	const { provider } = Connector.useContainer();
	const { useSnapshotSpaceQuery, useContractTxn } = useSynthetixQueries();

	const [block, setBlock] = useState<number | null>(null);
	const [name, setName] = useState<string>('');
	const [body, setBody] = useState<string>('');
	const [choices, setChoices] = useState<string[]>([]);
	const [result, setResult] = useState<AxiosResponse<any> | null>(null);
	const [signTransactionState, setSignTransactionState] = useState<Transaction>(
		Transaction.PRESUBMIT
	);
	const [signModalOpen, setSignModalOpen] = useState<boolean>(false);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [signError, setSignError] = useState<string | null>(null);
	const space = useSnapshotSpaceQuery(snapshotEndpoint, SPACE_KEY.PROPOSAL);
	const [ipfsHash, setIpfsHash] = useState<string | null>(null);

	const isL2 = useRecoilValue(isL2State);
	const { signer } = Connector.useContainer();

	const contract = useMemo(
		() => new ethers.Contract(CouncilDilution.address, CouncilDilution.abi, signer ?? undefined),
		[signer]
	);

	const txn = useContractTxn(
		contract,
		'logProposal',
		[ipfsHash],
		{},
		{ enabled: Boolean(ipfsHash), gasLimitBuffer: 0.5 }
	);

	const validSubmission = useMemo(() => {
		if (name.length > 0 && body.length > 0 && block && choices.length > 0) {
			return true;
		} else {
			return false;
		}
	}, [name, body, block, choices]);

	const createProposal = useSignMessage({
		onSuccess: async (response) => {
			setSignModalOpen(false);
			setResult(response);

			let ipfsHash = response?.data.ipfsHash;

			setIpfsHash(ipfsHash);

			if (isL2) {
				txn.mutate();
				setTxModalOpen(true);
				setSignTransactionState(Transaction.PRESUBMIT);
			} else {
				setSignTransactionState(Transaction.SUCCESS);
			}
		},
		onError: async (error) => {
			setSignTransactionState(Transaction.PRESUBMIT);
			setSignError(error.message);
		},
	});

	const handleCreate = async () => {
		try {
			if (space.data && block) {
				setSignError(null);

				setSignModalOpen(true);
				setSignTransactionState(Transaction.WAITING);

				const proposalPeriod = await contract.proposalPeriod();
				const proposalStartDate = Math.round(new Date().getTime() / 1000);
				const proposalEndDate = proposalStartDate + proposalPeriod.toNumber();

				createProposal.mutate({
					spaceKey: SPACE_KEY.PROPOSAL,
					type: SignatureType.PROPOSAL,
					payload: {
						name,
						body,
						choices,
						start: proposalStartDate,
						end: proposalEndDate,
						snapshot: Number(block),
						metadata: {
							plugins: {},
							network: '1',
							strategies: space.data.strategies as any,
						},
						type: 'single-choice',
					},
				});
			}
		} catch (error: any) {
			console.log(error);
			setSignTransactionState(Transaction.PRESUBMIT);
			txn.refresh();
			setSignError(error.message);
		}
	};

	useEffect(() => {
		const getCurrentBlock = async () => {
			if (provider) {
				const L1Provider = new ethers.providers.InfuraProvider(1, process.env.INFURA_ARCHIVE_KEY);
				let blockNumber = await L1Provider?.getBlockNumber();
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
						txTransactionState={txn.txnStatus}
						hash={ipfsHash}
						txHash={txn.hash}
					/>
				</Col>
				<Col>
					<Options choices={choices} setChoices={setChoices} />
					<Timing block={block} setBlock={setBlock} />
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
										space: SPACE_KEY.PROPOSAL,
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
