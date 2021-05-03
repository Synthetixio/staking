import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import DebtHedgingChart from './DebtHedgingChart';
import { FlexDivCol } from 'styles/common';

type DebtHedgingInfoPanelProps = {
	hidden: boolean;
};

const DebtHedgingInfoPanel: React.FC<DebtHedgingInfoPanelProps> = ({ hidden }) => {
	const { t } = useTranslation();

	if (hidden) return null;
	return (
		<InfoPanelContainer>
			<InfoPanelTitle>{t('debt.actions.manage.info-panel.title')}</InfoPanelTitle>
			<InfoPanelBody>{t('debt.actions.manage.info-panel.body')}</InfoPanelBody>
			<DebtHedgingChart />
		</InfoPanelContainer>
	);
};

const InfoPanelContainer = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.navy};
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
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;

	a {
		color: ${(props) => props.theme.colors.blue};
		text-decoration: none;
	}
`;

export default DebtHedgingInfoPanel;
