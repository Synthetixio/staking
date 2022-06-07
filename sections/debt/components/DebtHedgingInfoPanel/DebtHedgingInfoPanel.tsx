import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import DebtHedgingChart from './DebtHedgingChart';
import { ExternalLink, FlexDivCol } from 'styles/common';
import media from 'styled-media-query';
import { useRecoilValue } from 'recoil';
import { isMainnetState } from 'store/wallet';

type DebtHedgingInfoPanelProps = {
	hidden: boolean;
};

const UniswapNote = () => {
	return (
		<Trans
			i18nKey="debt.actions.manage.info-panel.uniswap-link"
			components={[
				<StyledLink href="https://info.uniswap.org/#/pools/0x9957c4795ab663622db54fc48fda874da59150ff" />,
			]}
		/>
	);
};
const TorosNote = () => {
	return (
		<Trans
			i18nKey="debt.actions.manage.info-panel.toros-link"
			components={[<StyledLink href="https://toros.finance/derivative/dsnx" />]}
		/>
	);
};

const DebtHedgingInfoPanel: React.FC<DebtHedgingInfoPanelProps> = ({ hidden }) => {
	const { t } = useTranslation();
	const isMainnet = useRecoilValue(isMainnetState);
	if (hidden) return null;
	return (
		<>
			<InfoPanelContainer>
				<InfoPanelTitle>{t('debt.actions.manage.info-panel.title')}</InfoPanelTitle>
				<InfoPanelBody>
					<Trans
						i18nKey="debt.actions.manage.info-panel.body"
						components={[
							<StyledLink href="https://docs.dhedge.org/dhedge-original-pools/v2-snx-debt-mirror" />,
						]}
					/>
					<br />
					<TextContainer>
						{t('debt.actions.manage.info-panel.dsnx-warning')}{' '}
						{isMainnet ? <UniswapNote /> : <TorosNote />}
					</TextContainer>
				</InfoPanelBody>
				<DebtHedgingChart />
			</InfoPanelContainer>
		</>
	);
};

const InfoPanelContainer = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.navy};
	width: 484px;
	${media.lessThan('medium')`
		width: 100%;
	`}
`;

const InfoPanelTitle = styled.p`
	padding: 30px;
	margin: 0;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 16px;
`;

const InfoPanelBody = styled.p`
	padding: 0px 30px 30px 30px;
	margin: 0;
	font-family: ${({ theme }) => theme.fonts.regular};
	color: ${({ theme }) => theme.colors.gray};
	font-size: 14px;
`;

const TextContainer = styled.div`
	margin-top: 8px;
`;

const StyledLink = styled(ExternalLink)`
	font-size: 14px;
	align-self: flex-end;
	color: ${(props) => props.theme.colors.blue};
`;

export default DebtHedgingInfoPanel;
