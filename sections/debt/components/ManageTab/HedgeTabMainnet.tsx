import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { ExternalLink } from '../../../../styles/common';
import { EXTERNAL_LINKS } from '../../../../constants/links';

export default function HedgeTapMainnet() {
	const { t } = useTranslation();

	return (
		<StyledHedgeWrapper>
			<Headline>{t('debt.actions.manage.l1-deprecation.headline')}</Headline>
			<p>{t('debt.actions.manage.l1-deprecation.remove-liquidity')}</p>
			<p>{t('debt.actions.manage.l1-deprecation.holding-text')}</p>
			<p>{t('debt.actions.manage.l1-deprecation.holding-text')}</p>
			<p>
				{t('debt.actions.manage.l1-deprecation.step-1')}{' '}
				<StyledExternalLink href={EXTERNAL_LINKS.multichain.app}>
					{EXTERNAL_LINKS.multichain.app}
				</StyledExternalLink>
			</p>
			<p>{t('debt.actions.manage.l1-deprecation.step-2')}</p>
			<p>
				{t('debt.actions.manage.l1-deprecation.step-3')}{' '}
				<StyledExternalLink href={EXTERNAL_LINKS.dHedge.dSNXPool}>
					{t('debt.actions.manage.l1-deprecation.link-text')}
				</StyledExternalLink>
			</p>
		</StyledHedgeWrapper>
	);
}

const StyledHedgeWrapper = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	color: #828295;
	font-family: Inter;
	font-size: 14px;
	text-transform: initial;
`;

const Headline = styled.h3`
	color: white;
`;
const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.blue};
`;
