import { useTranslation } from 'react-i18next';

import { InfoContainer, Title, Subtitle } from '../../components/common';

const InfoBox = () => {
	const { t } = useTranslation();
	return (
		<InfoContainer>
			<Title>{t('layer2.deposit.info.title')}</Title>
			<Subtitle> {t('layer2.deposit.info.subtitle')}</Subtitle>
		</InfoContainer>
	);
};

export default InfoBox;
