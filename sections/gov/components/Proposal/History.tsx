import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Spinner from 'assets/svg/app/loader.svg';
import useActiveTab from '../../hooks/useActiveTab';
import { FlexDivRowCentered } from 'styles/common';
import useProposal from 'queries/gov/useProposal';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { useTranslation } from 'react-i18next';
import { truncateAddress } from 'utils/formatters/string';
import { formatNumber } from 'utils/formatters/number';
import { MaxHeightColumn, StyledTooltip } from 'sections/gov/components/common';
import { Blockie } from '../common';
import makeBlockie from 'ethereum-blockies-base64';

type HistoryProps = {
	hash: string;
};

const History: React.FC<HistoryProps> = ({ hash }) => {
	const { t } = useTranslation();
	const activeTab = useActiveTab();
	const proposal = useProposal(activeTab, hash);
	const walletAddress = useRecoilValue(walletAddressState);

	if (proposal.isSuccess && proposal.data) {
		const { data } = proposal;

		return (
			<MaxHeightColumn>
				{data.voteList.length > 0 ? (
					data.voteList.map((vote: any, i: number) => {
						return (
							<Row key={i}>
								<FlexDivRowCentered>
									<Blockie src={makeBlockie(vote.address)} />
									<StyledTooltip
										arrow={true}
										placement="bottom"
										content={
											vote.address === walletAddress
												? t('gov.proposal.history.currentUser')
												: vote.profile.ens
												? vote.profile.ens
												: vote.address
										}
										hideOnClick={false}
									>
										<Title>
											{vote.address === walletAddress
												? t('gov.proposal.history.currentUser')
												: vote.profile.ens
												? vote.profile.ens
												: truncateAddress(vote.address)}
										</Title>
									</StyledTooltip>
								</FlexDivRowCentered>

								<StyledTooltip
									arrow={true}
									placement="bottom"
									content={data.choices[vote.msg.payload.choice - 1]}
									hideOnClick={false}
								>
									<Choice>- {truncateAddress(data.choices[vote.msg.payload.choice - 1])}</Choice>
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
};
export default History;

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
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
