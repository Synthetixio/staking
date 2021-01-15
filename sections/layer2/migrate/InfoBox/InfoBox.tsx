import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import { InfoContainer, Title, Subtitle } from '../../components/common';
import { FlexDivCol } from 'styles/common';
import Warning from 'assets/svg/app/warning.svg';

const InfoBox = () => {
	const { t } = useTranslation();
	return (
		<InfoContainer>
			<InfoContainerHeader>
				<Title>{t('layer2.migrate.info.title')}</Title>
				<Subtitle> {t('layer2.migrate.info.subtitle')}</Subtitle>
			</InfoContainerHeader>
			<InfoContainerBody>
				<Svg src={Warning} />
				<WarningHeading>{t('layer2.migrate.info.warning-title')}</WarningHeading>
				<WarningBody>{t('layer2.migrate.info.warning-description')}</WarningBody>
			</InfoContainerBody>
		</InfoContainer>
	);
};

const InfoContainerHeader = styled(FlexDivCol)`
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
`;

const InfoContainerBody = styled(FlexDivCol)`
	margin: 42px auto;
	align-items: center;
	width: 60%;
`;

const Bold = css`
	font-family: ${(props) => props.theme.fonts.condensedBold};
`;

const WarningHeading = styled.h2`
	color: ${(props) => props.theme.colors.pink};
	margin: 14px 0;
	${Bold};
`;

const WarningBody = styled.p`
	${Bold}
	margin: 0;
	text-align: center;
`;

export default InfoBox;
