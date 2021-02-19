import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';

type FormButtonProps = {};

const FormButton: React.FC<FormButtonProps> = ({}) => {
	const { t } = useTranslation();

	return (
		<StyledCTA blue={false} variant="primary" size="lg" disabled={false}>
			{t('loans.tabs.form.default-button-label')} sETH
		</StyledCTA>
	);
};

export default FormButton;

const StyledCTA = styled(Button)<{ blue: boolean; disabled: boolean }>`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: ${(props) =>
		props.blue
			? `0px 0px 10px rgba(0, 209, 255, 0.9)`
			: `0px 0px 8.38542px rgba(252, 135, 56, 0.6);`};
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;
