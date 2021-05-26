import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Svg } from 'react-optimized-image';
import makeBlockie from 'ethereum-blockies-base64';

import Etherscan from 'containers/BlockExplorer';

import { FlexDivRowCentered, ExternalLink } from 'styles/common';
import { truncateAddress } from 'utils/formatters/string';
import { formatTxTimestamp } from 'utils/formatters/date';
import Link from 'assets/svg/app/link.svg';
import { Blockie } from '../common';
import { Card } from 'sections/gov/components/common';
import { Proposal } from 'queries/gov/types';
import { useTranslation } from 'react-i18next';

type DetailsProps = {
	proposal: Proposal;
};

const Details: React.FC<DetailsProps> = ({ proposal }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const { blockExplorerInstance } = Etherscan.useContainer();

	return (
		<InfoCard>
			<Row>
				<Title>{t('gov.proposal.info.author')}</Title>
				<Value>
					<Blockie src={makeBlockie(proposal.author)} />
					{truncateAddress(proposal.author)}
					<ExternalLink
						href={
							blockExplorerInstance ? blockExplorerInstance.addressLink(proposal.author) : undefined
						}
					>
						<Svg style={{ marginLeft: 4 }} color={theme.colors.blue} src={Link} />
					</ExternalLink>
				</Value>
			</Row>
			<Row>
				<Title>{t('gov.proposal.info.time')}</Title>
				<Value>
					{formatTxTimestamp(proposal.start * 1000)} - {formatTxTimestamp(proposal.end * 1000)}
				</Value>
			</Row>
			<Row>
				<Title>{t('gov.proposal.info.snapshot')}</Title>
				<Value>
					{proposal.snapshot}
					<ExternalLink
						href={
							blockExplorerInstance ? blockExplorerInstance.blockLink(proposal.snapshot) : undefined
						}
					>
						<Svg style={{ marginLeft: 4 }} color={theme.colors.blue} src={Link} />
					</ExternalLink>
				</Value>
			</Row>
		</InfoCard>
	);
};
export default Details;
const InfoCard = styled(Card)`
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
