import { Trans, useTranslation } from 'react-i18next';
import {
	Container,
	Data,
	Header,
	StyledLink,
	StyledTable,
	Subtitle,
	TableNoResults,
	Title,
} from 'sections/escrow/components/common';

const InfoBox = () => {
	const { t } = useTranslation();
	return (
		<Container>
			<Title>{t('layer2.deposit.info.title')}</Title>
			<Subtitle>
				<Trans i18nKey="layer2.deposit.info.subtitle" components={[<StyledLink />]} />
			</Subtitle>
		</Container>
	);
};

export default InfoBox;
