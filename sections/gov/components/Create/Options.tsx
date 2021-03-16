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
		<StyledCard>
			<Title>{t('gov.create.choices')}</Title>
			<OptionsCol>
				{choices.map((_: string, i: number) => {
					return (
						<OptionRow key={i}>
							<Number>{i + 1}</Number>
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
			<ActionContainer>
				<AddOption
					variant="outline"
					onClick={() => setChoices((prevState: string[]) => [...prevState, ''])}
				>
					{t('gov.create.add')}
				</AddOption>
			</ActionContainer>
		</StyledCard>
	);
};
export default Options;

const StyledCard = styled(Card)`
	max-height: 350px;
`;

const Number = styled.p`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	margin-left: 8px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	text-align: center;
`;

const OptionsCol = styled(FlexDivColCentered)`
	margin: 16px 8px;
	max-height: 220px;
	overflow-y: auto;
`;

const OptionRow = styled(FlexDivRowCentered)`
	width: 100%;
	min-height: 45px;
	margin: 4px 0px;
	background-color: ${(props) => props.theme.colors.navy};
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

const ActionContainer = styled.div`
	padding: 0px 8px;
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
