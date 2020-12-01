import React, { FC, useState } from 'react';
import styled from 'styled-components';

import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import SelectButton from './SelectButton';

type DatePickerProps = ReactDatePickerProps & {
	className?: string;
	errorMessage?: React.ReactNode;
};

export const DatePicker: FC<DatePickerProps> = ({ className, errorMessage, ...rest }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<DatePickerContainer className={className}>
			<ReactDatePicker
				autoComplete="off"
				// https://github.com/Hacker0x01/react-datepicker/issues/2165
				customInput={React.createElement(React.forwardRef(SelectButton), { isOpen })}
				showPopperArrow={false}
				onCalendarClose={() => setIsOpen(false)}
				onCalendarOpen={() => setIsOpen(true)}
				{...rest}
			/>
		</DatePickerContainer>
	);
};

const DatePickerContainer = styled.div`
	.react-datepicker-popper {
		width: max-content;
	}

	.react-datepicker {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 0.8rem;
		background-color: ${(props) => props.theme.colors.white};
		border: 1px solid #aeaeae;
		border-radius: 2px;
		display: inline-block;
		position: relative;
	}
`;

export default DatePicker;
