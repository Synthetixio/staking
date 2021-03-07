import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import makeBlockie from 'ethereum-blockies-base64';
import Img, { Svg } from 'react-optimized-image';

import { ExternalLink, FlexDivRowCentered } from 'styles/common';

import Spinner from 'assets/svg/app/loader.svg';

import Etherscan from 'containers/Etherscan';
import { truncateAddress } from 'utils/formatters/string';

import SpartanCouncilNFT from 'assets/gifs/SC-NFT.gif';
import Link from 'assets/svg/app/link.svg';
import useCouncilMembers from '../../hooks/useCouncilMembers';
import { Blockie } from '../common';
import { Card } from 'sections/gov/components/common';

const CouncilBoard: React.FC = () => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const theme = useTheme();
	const councilMembers = useCouncilMembers();

	return (
		<StyledCard>
			<Img width={'100%'} src={SpartanCouncilNFT} />
			<Title>{t('gov.council.title')}</Title>

			{councilMembers ? (
				councilMembers.length > 0 ? (
					councilMembers.map((member, i) => (
						<MemberRow key={i}>
							<FlexDivRowCentered>
								<Blockie src={makeBlockie(member)} />
								<Address>{truncateAddress(member, 7, 7)}</Address>
							</FlexDivRowCentered>
							<ExternalLink
								href={etherscanInstance ? etherscanInstance.addressLink(member) : undefined}
							>
								<Svg color={theme.colors.blue} src={Link} />
							</ExternalLink>
						</MemberRow>
					))
				) : (
					<MemberRow>
						<Address>{t('gov.council.empty')}</Address>
					</MemberRow>
				)
			) : (
				<StyledSpinner src={Spinner} />
			)}
		</StyledCard>
	);
};
export default CouncilBoard;

const StyledCard = styled(Card)`
	padding: 0px;
	width: 250px;
`;

const Title = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 14px;
	text-transform: capitalize;
	text-align: center;
	padding: 4px 8px;
`;

const MemberRow = styled(FlexDivRowCentered)`
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	margin: 8px 0px;
	padding: 4px 16px;
`;

const Address = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
`;

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;
