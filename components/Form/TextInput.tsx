import { FC } from 'react';
import styled from 'styled-components';

import { FormLabel } from './common';
import { FlexDivColCentered } from 'styles/common';

type TextInputProps = {
	value: string;
	placeholder: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	isDisabled?: boolean;
	label?: string;
};

const TextInput: FC<TextInputProps> = ({ value, placeholder, onChange, isDisabled, label }) => {
	return (
		<Container>
			{label ? <FormLabel>{label}</FormLabel> : null}
			<Input
				value={value}
				placeholder={placeholder}
				onChange={onChange}
				disabled={isDisabled}
				spellCheck="false"
			/>
		</Container>
	);
};

const Container = styled(FlexDivColCentered)`
	margin: 24px auto;
	padding-left: 12px;
`;

const Input = styled.textarea`
	padding: 0;
	font-size: 14px;
	width: 100%;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 20px;
	overflow: hidden;
	resize: none;
	color: white;
	border: none;
	outline: none;
	height: 60px;
	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

export default TextInput;
