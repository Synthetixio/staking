import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Spinner from 'assets/svg/app/loader.svg';
import useActiveTab from '../../hooks/useActiveTab';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import useProposal from 'queries/gov/useProposal';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { useTranslation } from 'react-i18next';
import { truncateAddress, truncateString } from 'utils/formatters/string';
import { formatNumber } from 'utils/formatters/number';
import { MaxHeightColumn, StyledTooltip } from 'sections/gov/components/common';
import { Blockie } from '../common';
import makeBlockie from 'ethereum-blockies-base64';
import { ethers } from 'ethers';

type HistoryProps = {
	hash: string;
};

const History: React.FC<HistoryProps> = ({ hash }) => {
	const { t } = useTranslation();
	const activeTab = useActiveTab();
	const proposal = useProposal(activeTab, hash);
	const walletAddress = useRecoilValue(walletAddressState);

	const { getAddress } = ethers.utils;

	const history = useMemo(() => {
		if (proposal.data) {
			const { data } = proposal;
			return (
				<MaxHeightColumn>
					<Row>
						<Title>{t('gov.proposal.history.total', { totalVotes: data.voteList.length })}</Title>
					</Row>
					{data.voteList.length > 0 ? (
						data.voteList.map((vote, i: number) => {
							const currentWalletAddress = walletAddress ? getAddress(walletAddress) : '';
							return (
								<Row key={i}>
									<InnerRow>
										<Blockie src={makeBlockie(vote.address)} />
										<StyledTooltip
											arrow={true}
											placement="bottom"
											content={
												getAddress(vote.address) === currentWalletAddress
													? t('gov.proposal.history.currentUser')
													: vote.profile.ens
													? vote.profile.ens
													: getAddress(vote.address)
											}
											hideOnClick={false}
										>
											<Title>
												{getAddress(vote.address) === currentWalletAddress
													? t('gov.proposal.history.currentUser')
													: vote.profile.ens
													? truncateString(vote.profile.ens, 13)
													: truncateAddress(getAddress(vote.address))}
											</Title>
										</StyledTooltip>
									</InnerRow>
									<StyledTooltip
										arrow={true}
										placement="bottom"
										content={data.choices[vote.msg.payload.choice - 1]}
										hideOnClick={false}
									>
										<Choice>
											- {truncateString(data.choices[vote.msg.payload.choice - 1], 13)}
										</Choice>
									</StyledTooltip>
									<Value>{`${formatNumber(vote.balance)} ${data.spaceSymbol}`}</Value>
								</Row>
							);
						})
					) : (
						<Row>
							<Title>{t('gov.proposal.history.empty')}</Title>
						</Row>
					)}
				</MaxHeightColumn>
			);
		} else {
			return <StyledSpinner src={Spinner} />;
		}
	}, [proposal, walletAddress, t, getAddress]);

	return history;
};
export default History;

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;

const InnerRow = styled(FlexDivRow)`
	width: 150px;
	justify-content: flex-start;
	align-items: center;
`;
const Row = styled(FlexDivRowCentered)`
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	padding: 8px;
	margin: 8px 8px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	margin-left: 8px;
	text-align: left;
`;

const Value = styled(FlexDivRowCentered)`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	width: 100px;
	margin-left: 8px;
	width: 33%;
`;
const Choice = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	width: 100px;
	margin-left: 8px;
	width: 33%;
`;
