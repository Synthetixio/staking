import styled from 'styled-components';

import { FlexDivColCentered, FlexDivRowCentered, FlexDivCol, ExternalLink } from 'styles/common';
import Button from 'components/Button';
import Input from 'components/Input/Input';
import Select from 'components/Select';

export const InputContainer = styled(FlexDivColCentered)`
	background: ${(props) => props.theme.colors.black};
	position: relative;
	width: 100%;
	padding: 16px;
	margin-bottom: 24px;
	/* @TODO: Replace with responsive height when mobile */
	height: 600px;
`;
