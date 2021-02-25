import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import Button from 'components/Button';
import { NoTextTransform } from 'styles/common';

type FormButtonProps = {
	label: 'string';
};

const FormButton: React.FC<FormButtonProps> = ({ label }) => {
	const { t } = useTranslation();

	return (
		<StyledCTA variant="primary" size="lg">
			<Trans i18nKey={label} values={{}} components={[<NoTextTransform />]} />
		</StyledCTA>
	);
};

export default FormButton;

const StyledCTA = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;
