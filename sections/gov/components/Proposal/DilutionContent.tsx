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
import { proposalState } from 'store/gov';
import Button from 'components/Button';

import CouncilDilution from 'contracts/councilDilution.js';
import { ethers } from 'ethers';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { walletAddressState } from 'store/wallet';
import { normalizeGasLimit } from 'utils/network';
import { useCouncilMembers } from 'sections/gov/hooks/useCouncilMembers';

import { Transaction } from 'constants/network';
import Etherscan from 'containers/Etherscan';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import Notify from 'containers/Notify';
import TxState from 'sections/gov/components/TxState';
import useProposal from 'queries/gov/useProposal';

type DilutionContentProps = {
	onBack: Function;
};

const DilutionContent: React.FC<DilutionContentProps> = ({ onBack }) => {
	const { t } = useTranslation();

	const [voteMutate] = useSignMessage();
	const activeTab = useActiveTab();
	const [selected, setSelected] = useState<number | null>(null);

	const [signError, setSignError] = useState<string | null>(null);

	const [txError, setTxError] = useState<string | null>(null);

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [signTransactionState, setSignTransactionState] = useState<Transaction>(
		Transaction.PRESUBMIT
	);

	const [txHash, setTxHash] = useState<string | null>(null);

	const [hasDiluted, setHasDiluted] = useState<boolean>(false);
	const [canDilute, setCanDilute] = useState<boolean>(false);
	const [isCouncilMember, setIsCouncilMember] = useState<boolean>(false);
	const [targetDilutionAddress, setTargetDilutionAddress] = useState<string | null>(null);

	const { monitorHash } = Notify.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const link =
		etherscanInstance != null && txHash != null ? etherscanInstance.txLink(txHash) : undefined;

	const proposal = useRecoilValue(proposalState);
	const isAppReady = useRecoilValue(appReadyState);
	const walletAddress = useRecoilValue(walletAddressState);

	const proposalQuery = useProposal(activeTab, proposal?.authorIpfsHash ?? '');

	const { signer } = Connector.useContainer();

	const councilMembers = useCouncilMembers();

	useEffect(() => {
		if (isAppReady && walletAddress && councilMembers) {
			setIsCouncilMember(councilMembers.includes(walletAddress.toLowerCase()));
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
					const hash = proposal.authorIpfsHash;

					let gasEstimate;

					const latestElectionHash = await contract.latestElectionHash();

					const memberVotedFor = await contract.electionMemberVotedFor(
						latestElectionHash,
						walletAddress
					);

					if (hasDiluted) {
						gasEstimate = await getGasEstimateForTransaction(
							[hash, memberVotedFor],
							contract.estimateGas.invalidateDilution
						);
					} else {
						gasEstimate = await getGasEstimateForTransaction(
							[hash, memberVotedFor],
							contract.estimateGas.dilute
						);
					}

					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
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

				const hasDiluted = await contract.hasAddressDilutedForProposal(
					proposal.authorIpfsHash,
					walletAddress
				);

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
				payload: { proposal: proposal.authorIpfsHash, choice: selected + 1, metadata: {} },
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

					const hash = proposal.authorIpfsHash;

					const latestElectionHash = await contract.latestElectionHash();

					const memberVotedFor = contract.electionMemberVotedFor(latestElectionHash, walletAddress);

					const transaction: ethers.ContractTransaction = await contract.invalidateDilution(
						hash,
						memberVotedFor,
						{
							gasLimitEstimate,
						}
					);

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorHash({
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
	}, [gasLimitEstimate, isAppReady, monitorHash, proposal, proposalQuery, signer, walletAddress]);

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

					const hash = proposal.authorIpfsHash;

					const latestElectionHash = await contract.latestElectionHash();

					const memberVotedFor = contract.electionMemberVotedFor(latestElectionHash, walletAddress);

					const transaction: ethers.ContractTransaction = await contract.dilute(
						hash,
						memberVotedFor,
						{
							gasLimitEstimate,
						}
					);

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorHash({
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
	}, [signer, monitorHash, isAppReady, proposal, walletAddress, gasLimitEstimate, proposalQuery]);

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
								<LinkText>{t('earn.actions.tx.link')}</LinkText>
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
									hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
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
									hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
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
									{t('earn.actions.tx.dismiss')}
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
				{!expired(proposal?.msg.payload.end) ? (
					isCouncilMember ? (
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
					)
				) : null}
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
												hash: truncateAddress(proposal?.authorIpfsHash ?? ''),
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
