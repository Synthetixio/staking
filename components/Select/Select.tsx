import React, { FC, useContext, useMemo } from 'react';
import ReactSelect, { Props, StylesConfig } from 'react-select';
import { ThemeContext } from 'styled-components';

const IndicatorSeparator: FC = () => null;

function Select<T>(props: Props<T>) {
	const { colors, fonts } = useContext(ThemeContext);

	const computedStyles = useMemo(() => {
		const styles: StylesConfig = {
			container: (provided, state) => ({
				...provided,
				opacity: state.isDisabled ? 0.4 : 1,
				backgroundColor: colors.mediumBlue,
			}),
			singleValue: (provided) => ({
				...provided,
				color: colors.white,
				boxShadow: `0px 0px 20px ${colors.backgroundBoxShadow}`,
				fontSize: '12px',
				border: 'none',
			}),
			multiValueLabel: (provided) => ({
				...provided,
				background: colors.mediumBlue,
				borderRadius: 0,
				color: colors.white,
				fontSize: '12px',
				padding: 0,
			}),
			multiValueRemove: (provided) => ({
				...provided,
				background: colors.mediumBlue,
				borderRadius: 0,
				color: colors.white,
				'&:hover': {
					background: colors.mediumBlue,
					color: colors.red,
				},
				padding: 0,
			}),
			control: (provided) => ({
				...provided,
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
				backgroundColor: colors.mediumBlue,
			}),
			menu: (provided) => ({
				...provided,
				backgroundColor: colors.mediumBlue,
				border: 'none',
				boxShadow: `0px 0px 20px ${colors.backgroundBoxShadow}`,
				padding: 0,
			}),
			menuList: (provided) => ({
				...provided,
				borderRadius: 0,
				padding: 0,
				textAlign: 'left',
			}),
			option: (provided) => ({
				...provided,
				fontFamily: fonts.condensedBold,
				color: colors.gray10,
				cursor: 'pointer',
				padding: '12px 10px',
				fontSize: '12px',
				backgroundColor: colors.mediumBlue,
				'&:hover': {
					backgroundColor: colors.tooltipBlue,
					color: colors.white,
				},
			}),
			placeholder: (provided) => ({
				...provided,
				fontSize: '12px',
				color: colors.white,
				textTransform: 'capitalize',
			}),
			dropdownIndicator: (provided, state) => ({
				...provided,
				color: colors.white,
				transition: 'transform 0.2s ease-in-out',
				transform: state.selectProps.menuIsOpen && 'rotate(180deg)',
				'&:hover': {
					color: colors.white,
				},
			}),
		};
		return styles;
	}, [colors, fonts]);

	return (
		<ReactSelect
			styles={computedStyles}
			classNamePrefix="react-select"
			components={{ IndicatorSeparator }}
			{...props}
		/>
	);
}

export default Select;
