import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';

import CurrencyIcon from '../CurrencyIcon';

import { CurrencyKey } from 'constants/currency';

import { ContainerRow } from '../common';

type CurrencyNameProps = {
	currencyKey: CurrencyKey;
	symbol?: string;
	name?: string | null;
	showIcon?: boolean;
	isDeprecated?: boolean;
	iconProps?: object;
};

export const CurrencyName: FC<CurrencyNameProps> = ({
	currencyKey,
	symbol,
	name = null,
	showIcon = false,
	isDeprecated = false,
	iconProps = {},
	...rest
}) => {
	const { t } = useTranslation();
	return (
		<Container {...{ showIcon }} {...rest}>
			{showIcon && (
				<CurrencyIcon className="icon" {...{ currencyKey, isDeprecated }} {...iconProps} />
			)}
			<NameAndSymbol>
				<Symbol className="symbol">
					{symbol || currencyKey}
					{!isDeprecated ? null : (
						<Deprecated>
							<DeprecatedDot></DeprecatedDot> {t('common.currency.deprecated')}
						</Deprecated>
					)}
				</Symbol>
				{name && <Name className="name">{name}</Name>}
			</NameAndSymbol>
		</Container>
	);
};

const Container = styled.span<{ showIcon?: boolean }>`
	${(props) =>
		props.showIcon &&
		css`
			display: inline-grid;
			align-items: center;
			grid-auto-flow: column;
			grid-gap: 8px;
		`}
`;

const NameAndSymbol = styled(ContainerRow)``;

const Symbol = styled.span`
	display: flex;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.condensedBold};
`;

const Name = styled.span`
	color: ${(props) => props.theme.colors.gray};
`;

const Deprecated = styled.div`
	display: flex;
	align-items: center;
	color: ${(props) => props.theme.colors.red};
	margin-left: 10px;
	text-transform: uppercase;
`;

const DeprecatedDot = styled.div`
	width: 9px;
	height: 9px;
	background: ${(props) => props.theme.colors.red};
	box-shadow: 0px 0px 10px ${(props) => props.theme.colors.red};
	margin-right: 4px;
	border-radius: 50%;
`;

export default CurrencyName;
