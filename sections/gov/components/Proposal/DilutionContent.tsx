import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';

import {
	IconButton,
	Divider,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemText,
	ModalItemTitle,
	ExternalLink,
} from 'styles/common';

import NavigationBack from 'assets/svg/app/navigation-back.svg';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';

import {
	InputContainer,
	Container,
	HeaderRow,
	Header,
	StyledCTA,
	StyledTooltip,
	GreyHeader,
	GreyText,
	LinkText,
	VerifyButton,
	DismissButton,
	ButtonSpacer,
	WhiteSubheader,
} from 'sections/gov/components/common';

import { truncateAddress } from 'utils/formatters/string';
import { Trans, useTranslation } from 'react-i18next';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { useRecoilValue } from 'recoil';
import { proposalState } from 'store/gov';
import Button from 'components/Button';

import CouncilDilution from 'contracts/councilDilution.js';
import { ethers } from 'ethers';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { walletAddressState } from 'store/wallet';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { useCouncilMembers } from 'sections/gov/hooks/useCouncilMembers';

import { Transaction } from 'constants/network';
import Etherscan from 'containers/Etherscan';
import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import Notify from 'containers/Notify';
import TxState from 'sections/gov/components/TxState';

type DilutionContentProps = {
	onBack: Function;
};

const DilutionContent: React.FC<DilutionContentProps> = ({ onBack }) => {
	const { t } = useTranslation();

	const [voteMutate] = useSignMessage();
	const activeTab = useActiveTab();
	const [selected, setSelected] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [hasDiluted, setHasDiluted] = useState<boolean>(false);
	const [canDilute, setCanDilute] = useState<boolean>(false);

	const { monitorHash } = Notify.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const link =
		etherscanInstance != null && txHash != null ? etherscanInstance.txLink(txHash) : undefined;

	//* *//

	const proposal = useRecoilValue(proposalState);
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);

	const { signer } = Connector.useContainer();

	// const councilMembers = useCouncilMembers();

	// const isCouncilMember = councilMembers.includes(walletAddress);

	const isCouncilMember = false;

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && proposal && !isCouncilMember && canDilute) {
				try {
					setError(null);
					const contract = new ethers.Contract(
						CouncilDilution.address,
						CouncilDilution.abi,
						signer as any
					);
					const hash = proposal.authorIpfsHash;

					const memberVotedFor = await contract.electionMemberVotedFor(hash, walletAddress);

					let gasEstimate = await getGasEstimateForTransaction(
						[hash, memberVotedFor],
						contract.estimateGas.dilute
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [proposal, signer, isAppReady, canDilute, isCouncilMember]);

	useEffect(() => {
		const hasUserDiluted = async () => {
			if (isAppReady && proposal && !isCouncilMember) {
				const contract = new ethers.Contract(
					CouncilDilution.address,
					CouncilDilution.abi,
					signer as any
				);

				const hasDiluted = contract.hasAddressDilutedForProposal(
					proposal.authorIpfsHash,
					walletAddress
				);

				setHasDiluted(hasDiluted);
			}
		};
		hasUserDiluted();
	}, [proposal, isAppReady, isCouncilMember]);

	useEffect(() => {
		const checkCanDilute = async () => {
			if (isAppReady && proposal && !isCouncilMember) {
				const contract = new ethers.Contract(
					CouncilDilution.address,
					CouncilDilution.abi,
					signer as any
				);

				const latestElectionHash = await contract.latestElectionHash();

				const memberVotedFor = await contract.electionMemberVotedFor(
					latestElectionHash,
					walletAddress
				);

				if (memberVotedFor === ethers.constants.AddressZero) {
					setCanDilute(false);
				} else {
					setCanDilute(true);
				}
			}
		};
		checkCanDilute();
	}, [proposal, isCouncilMember, isAppReady]);

	const handleVote = async (hash?: string | null) => {
		if (hash && selected !== null) {
			setTransactionState(Transaction.WAITING);
			voteMutate({
				spaceKey: activeTab,
				type: SignatureType.VOTE,
				payload: { proposal: hash, choice: selected + 1, metadata: {} },
			})
				.then((response) => {
					console.log(response);
					setTransactionState(Transaction.SUCCESS);
				})
				.catch((error) => {
					console.log(error);
					setError(error);
					setTransactionState(Transaction.PRESUBMIT);
				});
		}
	};

	const handleDilute = useCallback(() => {
		async function dilute() {
			if (isAppReady && proposal) {
				try {
					setError(null);
					setTxModalOpen(true);

					const contract = new ethers.Contract(
						CouncilDilution.address,
						CouncilDilution.abi,
						signer as any
					);

					const hash = proposal.authorIpfsHash;

					const latestElectionHash = await contract.latestElectionHash();

					const memberVotedFor = contract.electionMemberVotedFor(latestElectionHash, walletAddress);

					const gasLimit = await getGasEstimateForTransaction(
						[hash, memberVotedFor],
						contract.estimateGas.dilute
					);
					const transaction: ethers.ContractTransaction = await contract.dilute(
						hash,
						memberVotedFor,
						{
							gasPrice: normalizedGasPrice(gasPrice),
							gasLimit,
						}
					);

					if (transaction) {
						console.log(transaction);
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorHash({
							txHash: transaction.hash,
							onTxConfirmed: () => setTransactionState(Transaction.SUCCESS),
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setError(e.message);
				}
			}
		}
		dilute();
	}, [signer, gasPrice, monitorHash, isAppReady, proposal, walletAddress]);

	const expired = (timestamp?: number) => {
		if (!timestamp) return;
		if (Date.now() / 1000 > timestamp) {
			return true;
		} else {
			return false;
		}
	};

	const getRawMarkup = (value?: string | null) => {
		const remarkable = new Remarkable({
			html: false,
			breaks: true,
			typographer: false,
		})
			.use(linkify)
			.use(externalLink);

		if (!value) return { __html: '' };

		return { __html: remarkable.render(value) };
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				title={t('gov.actions.vote.waiting')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<GreyHeader>{t('gov.actions.vote.signing')}</GreyHeader>
						<WhiteSubheader>
							{t('gov.actions.vote.hash', {
								hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
							})}
						</WhiteSubheader>
						{/* <Divider />
						<GreyText>{t('gov.actions.tx.notice')}</GreyText>
						<ExternalLink href={link}>
							<LinkText>{t('earn.actions.tx.link')}</LinkText>
						</ExternalLink> */}
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<TxState
				title={t('gov.actions.vote.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<GreyHeader>{t('gov.actions.vote.signing')}</GreyHeader>
						<WhiteSubheader>
							{t('gov.actions.vote.hash', {
								hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
							})}
						</WhiteSubheader>
						<Divider />
						<ButtonSpacer>
							<DismissButton
								variant="secondary"
								onClick={() => {
									setTransactionState(Transaction.PRESUBMIT);
								}}
							>
								{t('earn.actions.tx.dismiss')}
							</DismissButton>
						</ButtonSpacer>
					</FlexDivColCentered>
				}
			/>
		);
	}

	return (
		<>
			<Container>
				<InputContainer>
					<HeaderRow>
						<IconButton onClick={() => onBack(null)}>
							<Svg src={NavigationBack} />
						</IconButton>
						<Header>#{truncateAddress(proposal?.authorIpfsHash ?? '')}</Header>
						<Status active={!expired(proposal?.msg.payload.end)}>
							{expired(proposal?.msg.payload.end)
								? t('gov.proposal.status.closed')
								: t('gov.proposal.status.open')}
						</Status>
					</HeaderRow>
					<ProposalContainer>
						<Title>{proposal?.msg.payload.name}</Title>
						<Description dangerouslySetInnerHTML={getRawMarkup(proposal?.msg.payload.body)} />
					</ProposalContainer>
					<Divider />
					{!expired(proposal?.msg.payload.end) && isCouncilMember && (
						<OptionsContainer>
							{proposal?.msg.payload.choices.map((choice, i) => (
								<StyledTooltip arrow={true} placement="bottom" content={choice} hideOnClick={false}>
									<Option
										selected={selected === i}
										onClick={() => setSelected(i)}
										variant="text"
										key={i}
									>
										<p>{choice}</p>
									</Option>
								</StyledTooltip>
							))}
						</OptionsContainer>
					)}
				</InputContainer>
				{isCouncilMember ? (
					<StyledCTA onClick={() => handleVote(proposal?.authorIpfsHash)} variant="primary">
						{t('gov.proposal.action.vote')}
					</StyledCTA>
				) : (
					<>
						<StyledCTA disabled={!canDilute} onClick={() => handleDilute()} variant="primary">
							{t('gov.proposal.action.withdraw')}
						</StyledCTA>
					</>
				)}
			</Container>
			{txModalOpen && (
				<TxConfirmationModal
					isSignature={true}
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={handleDilute}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-signature.vote.title')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-signature.vote.hash', {
										hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
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
export default DilutionContent;

const Status = styled.p<{ active: boolean }>`
	color: ${(props) => (props.active ? props.theme.colors.green : props.theme.colors.gray)};
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
`;

const ProposalContainer = styled(FlexDivColCentered)`
	min-height: 400px;
`;

const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
	text-align: center;
`;

const Description = styled.div`
	max-height: 300px;
	overflow-y: auto;
	font-size: 14px;
	text-align: center;
	font-family: ${(props) => props.theme.fonts.regular};
	margin: 16px 8px;

	width: 500px;

	h1 {
		font-size: 14px;
	}

	h2 {
		font-size: 14px;
	}

	h3 {
		font-size: 14px;
	}

	h4 {
		font-size: 14px;
	}

	h5 {
		font-size: 14px;
	}

	h6 {
		font-size: 14px;
	}

	a {
		color: ${(props) => props.theme.colors.blue};
		font-family: ${(props) => props.theme.fonts.interBold};
		text-decoration: none;
		font-size: 14px;
	}
`;

const OptionsContainer = styled.div`
	max-height: 200px;
	overflow-y: auto;
	width: 500px;
	display: grid;
	grid-template-columns: auto auto;
	column-gap: 8px;
	row-gap: 8px;
	padding-top: 16px;
`;

const Option = styled(Button)<{ selected: boolean }>`
	background-color: ${(props) =>
		props.selected ? props.theme.colors.mediumBlue : props.theme.colors.navy};
	color: ${(props) => (props.selected ? props.theme.colors.blue : props.theme.colors.white)};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.interBold};
	text-transform: uppercase;
	text-align: center;
	align-items: center;

	width: 235px;

	p {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		padding: 0px 16px;
		margin: 0;
	}

	:hover {
		background-color: ${(props) => props.theme.colors.mediumBlue};
		transition: background-color 0.25s;
	}
`;

const ActionContainer = styled.div``;
