import React, { useState, useCallback, useEffect } from 'react';
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
import media from 'styles/media';

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
import { useTranslation } from 'react-i18next';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import useActiveTab from 'sections/gov/hooks/useActiveTab';
import { useRecoilValue } from 'recoil';
import Button from 'components/Button';

import CouncilDilution from 'contracts/councilDilution.js';
import { ethers } from 'ethers';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { useCouncilMembers } from 'sections/gov/hooks/useCouncilMembers';

import { Transaction, GasLimitEstimate } from 'constants/network';
import Etherscan from 'containers/BlockExplorer';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import TransactionNotifier from 'containers/TransactionNotifier';
import TxState from 'sections/gov/components/TxState';
import useProposalQuery from 'queries/gov/useProposalQuery';
import { expired, pending } from '../helper';
import synthetix from 'lib/synthetix';
import { Proposal } from 'queries/gov/types';

type DilutionContentProps = {
	proposal: Proposal;
	onBack: Function;
};

const DilutionContent: React.FC<DilutionContentProps> = ({ proposal, onBack }) => {
	const { t } = useTranslation();

	const [voteMutate] = useSignMessage();
	const activeTab = useActiveTab();
	const [selected, setSelected] = useState<number | null>(null);

	const [signError, setSignError] = useState<string | null>(null);

	const [txError, setTxError] = useState<string | null>(null);

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [signTransactionState, setSignTransactionState] = useState<Transaction>(
		Transaction.PRESUBMIT
	);

	const [txHash, setTxHash] = useState<string | null>(null);

	const [hasDiluted, setHasDiluted] = useState<boolean>(false);
	const [canDilute, setCanDilute] = useState<boolean>(false);
	const [isCouncilMember, setIsCouncilMember] = useState<boolean>(false);
	const [targetDilutionAddress, setTargetDilutionAddress] = useState<string | null>(null);

	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const link =
		blockExplorerInstance != null && txHash != null
			? blockExplorerInstance.txLink(txHash)
			: undefined;

	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);

	const proposalQuery = useProposalQuery(activeTab, proposal?.id ?? '');

	const { signer } = Connector.useContainer();

	const councilMembers = useCouncilMembers();

	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	useEffect(() => {
		if (isAppReady && walletAddress && councilMembers) {
			const councilMemberAddresses = councilMembers.map((member) => member.address);
			setIsCouncilMember(councilMemberAddresses.includes(ethers.utils.getAddress(walletAddress)));
		}
	}, [isAppReady, walletAddress, councilMembers]);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && proposal && !isCouncilMember && canDilute) {
				try {
					setTxError(null);
					const contract = new ethers.Contract(
						CouncilDilution.address,
						CouncilDilution.abi,
						signer as any
					);
					const hash = proposal.id;

					let gasEstimate;

					const latestElectionHash = await contract.latestElectionHash();

					const memberVotedFor = await contract.electionMemberVotedFor(
						latestElectionHash,
						walletAddress
					);

					if (hasDiluted) {
						gasEstimate = await synthetix.getGasEstimateForTransaction({
							txArgs: [hash, memberVotedFor],
							method: contract.estimateGas.invalidateDilution,
						});
					} else {
						gasEstimate = await synthetix.getGasEstimateForTransaction({
							txArgs: [hash, memberVotedFor],
							method: contract.estimateGas.dilute,
						});
					}

					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setTxError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [proposal, signer, isAppReady, canDilute, isCouncilMember, hasDiluted, walletAddress]);

	useEffect(() => {
		const hasUserDiluted = async () => {
			if (isAppReady && proposal && !isCouncilMember) {
				const contract = new ethers.Contract(
					CouncilDilution.address,
					CouncilDilution.abi,
					signer as any
				);

				const hasDiluted = await contract.hasAddressDilutedForProposal(proposal.id, walletAddress);

				setHasDiluted(hasDiluted);
			}
		};
		hasUserDiluted();
	}, [proposal, isAppReady, isCouncilMember, signer, walletAddress]);

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
					setTargetDilutionAddress(memberVotedFor);
					setCanDilute(true);
				}
			}
		};
		checkCanDilute();
	}, [proposal, isCouncilMember, isAppReady, signer, walletAddress]);

	const handleVote = () => {
		if (proposal && selected !== null) {
			setTxModalOpen(true);
			setSignTransactionState(Transaction.WAITING);
			voteMutate({
				spaceKey: activeTab,
				type: SignatureType.VOTE,
				payload: { proposal: proposal.id, choice: selected + 1, metadata: {} },
			})
				.then((_) => {
					setTxModalOpen(false);
					setSignTransactionState(Transaction.SUCCESS);
				})
				.catch((error) => {
					console.log(error);
					setSignError(error);
					setSignTransactionState(Transaction.PRESUBMIT);
				});
		}
	};

	const handleUndoDilute = useCallback(() => {
		async function undoDilute() {
			if (isAppReady && proposal) {
				try {
					setTxError(null);
					setTxModalOpen(true);

					const contract = new ethers.Contract(
						CouncilDilution.address,
						CouncilDilution.abi,
						signer as any
					);

					const hash = proposal.id;

					const latestElectionHash = await contract.latestElectionHash();

					const memberVotedFor = contract.electionMemberVotedFor(latestElectionHash, walletAddress);

					const transaction: ethers.ContractTransaction = await contract.invalidateDilution(
						hash,
						memberVotedFor,
						{
							gasLimit: gasLimitEstimate,
						}
					);

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorTransaction({
							txHash: transaction.hash,
							onTxConfirmed: () => {
								setTransactionState(Transaction.SUCCESS);
								proposalQuery.refetch();
							},
						});

						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setTxError(e.message);
				}
			}
		}
		undoDilute();
	}, [
		gasLimitEstimate,
		isAppReady,
		monitorTransaction,
		proposal,
		proposalQuery,
		signer,
		walletAddress,
	]);

	const handleDilute = useCallback(() => {
		async function dilute() {
			if (isAppReady && proposal) {
				try {
					setTxError(null);
					setTxModalOpen(true);

					const contract = new ethers.Contract(
						CouncilDilution.address,
						CouncilDilution.abi,
						signer as any
					);

					const hash = proposal.id;

					const latestElectionHash = await contract.latestElectionHash();

					const memberVotedFor = contract.electionMemberVotedFor(latestElectionHash, walletAddress);

					const transaction: ethers.ContractTransaction = await contract.dilute(
						hash,
						memberVotedFor,
						{
							gasLimit: gasLimitEstimate,
						}
					);

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorTransaction({
							txHash: transaction.hash,
							onTxConfirmed: () => {
								setTransactionState(Transaction.SUCCESS);
								proposalQuery.refetch();
							},
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					setTxError(e.message);
				}
			}
		}
		dilute();
	}, [
		signer,
		monitorTransaction,
		isAppReady,
		proposal,
		walletAddress,
		gasLimitEstimate,
		proposalQuery,
	]);

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

	const returnInnerContent = () => {
		if (transactionState === Transaction.WAITING) {
			return (
				<TxState
					title={hasDiluted ? t('gov.actions.support.waiting') : t('gov.actions.withdraw.waiting')}
					content={
						<FlexDivColCentered>
							<Svg src={PendingConfirmation} />
							<GreyHeader>
								{hasDiluted ? t('gov.actions.support.waiting') : t('gov.actions.withdraw.waiting')}
							</GreyHeader>
							<WhiteSubheader>
								{hasDiluted
									? t('gov.actions.support.address', {
											address: truncateAddress(targetDilutionAddress ?? ''),
									  })
									: t('gov.actions.withdraw.address', {
											address: truncateAddress(targetDilutionAddress ?? ''),
									  })}
							</WhiteSubheader>
							<Divider />
							<GreyText>{t('gov.actions.tx.notice')}</GreyText>
							<ExternalLink href={link}>
								<LinkText>{t('gov.actions.tx.dismiss')}</LinkText>
							</ExternalLink>
						</FlexDivColCentered>
					}
				/>
			);
		}

		if (transactionState === Transaction.SUCCESS) {
			return (
				<TxState
					title={hasDiluted ? t('gov.actions.support.success') : t('gov.actions.withdraw.success')}
					content={
						<FlexDivColCentered>
							<Svg src={Success} />
							<GreyHeader>
								{hasDiluted ? t('gov.actions.support.signed') : t('gov.actions.withdraw.signed')}
							</GreyHeader>
							<WhiteSubheader>
								{hasDiluted
									? t('gov.actions.support.address', {
											address: truncateAddress(targetDilutionAddress ?? ''),
									  })
									: t('gov.actions.withdraw.address', {
											address: truncateAddress(targetDilutionAddress ?? ''),
									  })}
							</WhiteSubheader>
							<Divider />
							<ButtonSpacer>
								{link && (
									<ExternalLink href={link}>
										<VerifyButton>{t('gov.actions.tx.verify')}</VerifyButton>
									</ExternalLink>
								)}
								<DismissButton
									variant="secondary"
									onClick={() => {
										setTransactionState(Transaction.PRESUBMIT);
										onBack();
									}}
								>
									{t('gov.actions.tx.dismiss')}
								</DismissButton>
							</ButtonSpacer>
						</FlexDivColCentered>
					}
				/>
			);
		}

		if (signTransactionState === Transaction.WAITING) {
			return (
				<TxState
					title={t('gov.actions.vote.waiting')}
					content={
						<FlexDivColCentered>
							<Svg src={PendingConfirmation} />
							<GreyHeader>{t('gov.actions.vote.signing')}</GreyHeader>
							<WhiteSubheader>
								{t('gov.actions.vote.hash', {
									hash: truncateAddress(proposal?.id ?? ''),
								})}
							</WhiteSubheader>
						</FlexDivColCentered>
					}
				/>
			);
		}

		if (signTransactionState === Transaction.SUCCESS) {
			return (
				<TxState
					title={t('gov.actions.vote.success')}
					content={
						<FlexDivColCentered>
							<Svg src={Success} />
							<GreyHeader>{t('gov.actions.vote.signed')}</GreyHeader>
							<WhiteSubheader>
								{t('gov.actions.vote.hash', {
									hash: truncateAddress(proposal?.id ?? ''),
								})}
							</WhiteSubheader>
							<Divider />
							<ButtonSpacer>
								<DismissButton
									variant="secondary"
									onClick={() => {
										setSignTransactionState(Transaction.PRESUBMIT);
										onBack();
									}}
								>
									{t('gov.actions.tx.dismiss')}
								</DismissButton>
							</ButtonSpacer>
						</FlexDivColCentered>
					}
				/>
			);
		}

		return (
			<Container>
				<InputContainer>
					<HeaderRow>
						<IconButton onClick={() => onBack(null)}>
							<Svg src={NavigationBack} />
						</IconButton>
						<Header>#{truncateAddress(proposal?.id ?? '')}</Header>
						<Status closed={expired(proposal?.end)} pending={pending(proposal?.start)}>
							{expired(proposal?.end)
								? t('gov.proposal.status.closed')
								: pending(proposal?.start)
								? t('gov.proposal.status.pending')
								: t('gov.proposal.status.open')}
						</Status>
					</HeaderRow>
					<ProposalContainer>
						<Title>{proposal?.title}</Title>
						<Description dangerouslySetInnerHTML={getRawMarkup(proposal?.body)} />
					</ProposalContainer>
					<Divider />
					{isWalletConnected &&
						!expired(proposal?.end) &&
						!pending(proposal?.start) &&
						isCouncilMember && (
							<OptionsContainer>
								{proposal?.choices.map((choice, i) => (
									<StyledTooltip
										arrow={true}
										placement="bottom"
										content={choice}
										hideOnClick={false}
									>
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
				{isWalletConnected &&
					!expired(proposal?.end) &&
					!pending(proposal?.start) &&
					(isCouncilMember ? (
						<StyledCTA onClick={() => handleVote()} variant="primary">
							{t('gov.proposal.action.vote')}
						</StyledCTA>
					) : (
						<>
							{hasDiluted ? (
								<StyledCTA
									disabled={!canDilute}
									onClick={() => handleUndoDilute()}
									variant="primary"
								>
									{t('gov.proposal.action.support')}
								</StyledCTA>
							) : (
								<StyledCTA disabled={!canDilute} onClick={() => handleDilute()} variant="primary">
									{t('gov.proposal.action.withdraw')}
								</StyledCTA>
							)}
						</>
					))}
			</Container>
		);
	};

	return (
		<>
			{returnInnerContent()}
			{txModalOpen && (
				<TxConfirmationModal
					isSignature={isCouncilMember ? true : false}
					onDismiss={() => setTxModalOpen(false)}
					txError={isCouncilMember ? signError : txError}
					attemptRetry={() => (isCouncilMember ? handleVote() : handleDilute())}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>
									{isCouncilMember
										? t('modals.confirm-signature.vote.title')
										: hasDiluted
										? t('modals.confirm-transaction.support.title')
										: t('modals.confirm-transaction.withdraw.title')}
								</ModalItemTitle>
								<ModalItemText>
									{isCouncilMember
										? t('modals.confirm-signature.vote.hash', {
												hash: truncateAddress(proposal?.id ?? ''),
										  })
										: hasDiluted
										? t('modals.confirm-transaction.support.address', {
												address: truncateAddress(targetDilutionAddress ?? ''),
										  })
										: t('modals.confirm-transaction.withdraw.address', {
												address: truncateAddress(targetDilutionAddress ?? ''),
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

const Status = styled.p<{ closed: boolean; pending: boolean }>`
	color: ${(props) =>
		props.closed
			? props.theme.colors.gray
			: props.pending
			? props.theme.colors.yellow
			: props.theme.colors.green};
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

	${media.greaterThan('mdUp')`
		width: 500px;
	`}

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
	${media.greaterThan('mdUp')`
		width: 500px;
	`}
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
