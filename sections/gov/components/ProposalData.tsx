import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { ProposalInfoType, proposalState } from 'store/gov';
import styled, { useTheme } from 'styled-components';
import { FlexDivRowCentered, ExternalLink, FlexDivColCentered } from 'styles/common';
import { Blockie } from './common';
import makeBlockie from 'ethereum-blockies-base64';
import { truncateAddress } from 'utils/formatters/string';
import { formatTxTimestamp } from 'utils/formatters/date';
import { Svg } from 'react-optimized-image';
import Link from 'assets/svg/app/link.svg';
import Etherscan from 'containers/Etherscan';
import StructuredTab from 'components/StructuredTab';
import Results from './Results';
import { useRouter } from 'next/router';
import { SPACE_KEY } from 'constants/snapshot';
import useActiveTab from '../hooks/useActiveTab';

type ProposalDataProps = {};

const ProposalData: React.FC<ProposalDataProps> = ({}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const proposal = useRecoilValue(proposalState);
	const { etherscanInstance } = Etherscan.useContainer();
	const activeTab = useActiveTab();

	const tabData = useMemo(
		() => [
			{
				title: t('gov.proposal.votes.title'),
				tabChildren: <Results hash={proposal?.authorIpfsHash ?? ''} />,
				blue: true,
				key: ProposalInfoType.RESULTS,
			},
			{
				title: t('gov.proposal.history.title'),
				tabChildren: <></>,
				blue: true,
				key: ProposalInfoType.HISTORY,
			},
		],
		[ProposalInfoType, proposal, activeTab]
	);

	if (!proposal) return <></>;
	return (
		<Col>
			<InfoCard>
				<Row>
					<Title>{t('gov.proposal.info.author')}</Title>
					<Value>
						<Blockie src={makeBlockie(proposal.address)} />
						{truncateAddress(proposal.address)}

						<ExternalLink
							href={etherscanInstance ? etherscanInstance.blockLink(proposal.address) : undefined}
						>
							<Svg style={{ marginLeft: 4 }} color={theme.colors.blue} src={Link} />
						</ExternalLink>
					</Value>
				</Row>
				<Row>
					<Title>{t('gov.proposal.info.time')}</Title>
					<Value>
						{formatTxTimestamp(proposal.msg.payload.start * 1000)} -{' '}
						{formatTxTimestamp(proposal.msg.payload.end * 1000)}
					</Value>
				</Row>
				<Row>
					<Title>{t('gov.proposal.info.snapshot')}</Title>
					<Value>
						{proposal.msg.payload.snapshot}
						<ExternalLink
							href={
								etherscanInstance
									? etherscanInstance.blockLink(proposal.msg.payload.snapshot)
									: undefined
							}
						>
							<Svg style={{ marginLeft: 4 }} color={theme.colors.blue} src={Link} />
						</ExternalLink>
					</Value>
				</Row>
			</InfoCard>
			<StructuredTab boxPadding={0} tabData={tabData} boxWidth={400} />
		</Col>
	);
};
export default ProposalData;

const Col = styled(FlexDivColCentered)`
	width: 400px;
`;

const InfoCard = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	margin-bottom: 16px;
	padding: 16px;
	width: 100%;
`;

const Row = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	padding: 8px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.gray};
`;

const Value = styled(FlexDivRowCentered)`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
`;
