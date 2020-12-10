import React, { useContext, useMemo } from 'react';
import ReactSelect, { Props, StylesConfig } from 'react-select';
import { ThemeContext } from 'styled-components';

import { IndicatorSeparator, DropdownIndicator, MultiValueRemove } from './components';

function Select<T>(props: Props<T>) {
	const { colors, fonts } = useContext(ThemeContext);

	const computedStyles = useMemo(() => {
		const styles: StylesConfig = {
			container: (style, state) => ({
				...style,
				opacity: state.isDisabled ? 0.4 : 1,
				backgroundColor: colors.navy,
			}),
			singleValue: (style) => ({
				...style,
				color: colors.white,
				boxShadow: `0px 0px 20px ${colors.backgroundBoxShadow}`,
				fontSize: '12px',
				border: 'none',
			}),
			multiValue: (style) => ({
				...style,
				background: 'none',
				alignItems: 'flex-end',
			}),
			multiValueLabel: (style) => ({
				...style,
				background: colors.navy,
				borderRadius: 0,
				color: colors.white,
				fontSize: '12px',
				padding: 0,
				paddingLeft: 0,
			}),
			multiValueRemove: (style) => ({
				...style,
				background: colors.navy,
				borderRadius: 0,
				color: colors.gray,
				'&:hover': {
					background: colors.navy,
					color: colors.white,
				},
				padding: 0,
			}),
			noOptionsMessage: (style) => ({
				...style,
				fontSize: '12px',
				color: colors.white,
			}),
			control: (style) => ({
				...style,
				fontFamily: fonts.condensedBold,
				color: colors.white,
				cursor: 'pointer',
				boxShadow: `0px 0px 20px ${colors.backgroundBoxShadow}`,
				border: 'none',
				borderRadius: '4px',
				outline: 'none',
				'&:hover': {
					border: 'none',
				},
				fontSize: '12px',
				backgroundColor: colors.navy,
			}),
			menu: (style) => ({
				...style,
				backgroundColor: colors.navy,
				border: 'none',
				boxShadow: `0px 0px 20px ${colors.backgroundBoxShadow}`,
				padding: 0,
			}),
			menuList: (style) => ({
				...style,
				borderRadius: 0,
				padding: 0,
				textAlign: 'left',
			}),
			option: (style) => ({
				...style,
				fontFamily: fonts.condensedBold,
				color: colors.gray,
				cursor: 'pointer',
				padding: '12px 10px',
				fontSize: '12px',
				backgroundColor: colors.navy,
				'&:hover': {
					backgroundColor: colors.mediumBlue,
					color: colors.white,
				},
			}),
			placeholder: (style) => ({
				...style,
				fontSize: '12px',
				color: colors.white,
				textTransform: 'capitalize',
			}),
			dropdownIndicator: (style, state) => ({
				...style,
				color: state.selectProps.menuIsOpen ? colors.white : colors.gray,
				transition: 'transform 0.2s ease-in-out',
				transform: state.selectProps.menuIsOpen && 'rotate(180deg)',
				'&:hover': {
					color: colors.white,
				},
			}),
		};
		return styles;
	}, [colors, fonts]);

	const { components, ...rest } = props;

	return (
		<ReactSelect
			styles={computedStyles}
			classNamePrefix="react-select"
			components={{ IndicatorSeparator, DropdownIndicator, MultiValueRemove, ...components }}
			{...rest}
		/>
	);
}

export default Select;
