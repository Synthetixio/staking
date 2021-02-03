import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import makeBlockie from 'ethereum-blockies-base64';
import Img, { Svg } from 'react-optimized-image';

import { ExternalLink, FlexDivRowCentered } from 'styles/common';

import Etherscan from 'containers/Etherscan';
import { truncateAddress } from 'utils/formatters/string';

import SpartanCouncilNFT from 'assets/gifs/SC-NFT.gif';
import Link from 'assets/svg/app/link.svg';
import useCouncilMembers from '../hooks/useCouncilMembers';

const CouncilBoard: React.FC = () => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const theme = useTheme();
	const members = useCouncilMembers();

	return (
		<TabPanelContainer width={300} padding={0}>
			<Img width={'100%'} src={SpartanCouncilNFT} />
			<Title>{t('gov.council.title')}</Title>

			{members &&
				members.map((member, i) => (
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
				))}
		</TabPanelContainer>
	);
};
export default CouncilBoard;

const TabPanelContainer = styled.div<{ height?: number; width: number; padding: number }>`
	outline: none;
	background: ${(props) => props.theme.colors.backgroundBlue};
	box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
	height: ${(props) => (props.height != null ? `${props.height}px` : 'unset')};
	width: ${(props) => props.width}px;
	padding: ${(props) => props.padding}px;
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
const Blockie = styled.img`
	width: 25px;
	height: 25px;
	border-radius: 12.5px;
	margin-right: 10px;
`;
