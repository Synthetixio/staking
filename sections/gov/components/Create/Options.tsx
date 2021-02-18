import Button from 'components/Button';
import Input from 'components/Input/Input';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColCentered, FlexDivRowCentered } from 'styles/common';
import { Svg } from 'react-optimized-image';
import CrossIcon from 'assets/svg/app/cross.svg';
import { Card } from '../common';

type OptionsProps = {
	choices: string[];
	setChoices: Function;
};

const Options: React.FC<OptionsProps> = ({ choices, setChoices }) => {
	const { t } = useTranslation();
	return (
		<Card>
			<Title>{t('gov.create.choices')}</Title>
			<OptionsCol>
				{choices.map((_: string, i: number) => {
					return (
						<OptionRow key={i}>
							<Option
								value={choices[i]}
								onChange={(e) => {
									let item = [...choices];
									item[i] = e.target.value;
									setChoices(item);
								}}
							/>
							<Delete
								onClick={() => {
									let item = [...choices];

									item.splice(i, 1);

									setChoices(item);
								}}
								src={CrossIcon}
							/>
						</OptionRow>
					);
				})}
			</OptionsCol>
			<AddOption
				variant="outline"
				onClick={() => setChoices((prevState: string[]) => [...prevState, ''])}
			>
				{t('gov.create.add')}
			</AddOption>
		</Card>
	);
};
export default Options;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	text-align: center;
`;

const OptionsCol = styled(FlexDivColCentered)`
	padding: 16px 0px;
`;

const OptionRow = styled(FlexDivRowCentered)`
	width: 100%;
	height: 45px;
	margin: 4px 0px;
	border: 1px dashed ${(props) => props.theme.colors.mediumBlueHover};
`;

const Option = styled(Input)`
	text-align: center;
	background-color: ${(props) => props.theme.colors.navy};
	font-family: ${(props) => props.theme.fonts.interBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
`;

const Delete = styled(Svg)`
	margin-right: 8px;
	color: ${(props) => props.theme.colors.gray};
	cursor: pointer;
`;

const AddOption = styled(Button)`
	border: 1px dashed ${(props) => props.theme.colors.mediumBlueHover};
	text-align: center;
	background-color: ${(props) => props.theme.colors.navy};
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	height: 45px;
	width: 100%;
	margin: 4px 0px;
	text-transform: uppercase;
`;
