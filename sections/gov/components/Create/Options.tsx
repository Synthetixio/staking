import Button from 'components/Button';
import Input from 'components/Input/Input';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColCentered, FlexDivRowCentered } from 'styles/common';
import { Svg } from 'react-optimized-image';
import CrossIcon from 'assets/svg/app/cross.svg';
import Connector from 'containers/Connector';

type OptionsProps = {};

const Options: React.FC<OptionsProps> = ({}) => {
	const [options, setOptions] = useState<string[]>([]);
	const [block, setBlock] = useState<string>('');

	const { provider } = Connector.useContainer();

	useEffect(() => {
		const getCurrentBlock = async () => {
			if (provider) {
				let blockNumber = await provider?.getBlockNumber();
				setBlock(blockNumber.toString());
			}
		};

		getCurrentBlock();
	}, [provider]);

	const { t } = useTranslation();
	return (
		<Col>
			<InfoCard>
				<Title>{t('gov.create.choices')}</Title>
				<OptionsCol>
					{options.map((_: string, i: number) => {
						return (
							<OptionRow key={i}>
								<Option
									value={options[i]}
									onChange={(e) => {
										let item = [...options];
										item[i] = e.target.value;
										setOptions(item);
									}}
								/>
								<Delete
									onClick={() => {
										let item = [...options];

										item.splice(i, 1);

										setOptions(item);
									}}
									src={CrossIcon}
								/>
							</OptionRow>
						);
					})}
				</OptionsCol>
				<AddOption variant="outline" onClick={() => setOptions((prevState) => [...prevState, ''])}>
					{t('gov.create.add')}
				</AddOption>
			</InfoCard>
			<InfoCard>
				<Row>
					<Subtitle>{t('gov.create.start')}</Subtitle>
					<DateSelector />
				</Row>

				<Row>
					<Subtitle>{t('gov.create.end')}</Subtitle>
					<DateSelector />
				</Row>

				<Row>
					<Subtitle>{t('gov.create.block')}</Subtitle>
					<BlockInput value={block} onChange={(e) => setBlock(e.target.value)} type="number" />
				</Row>
			</InfoCard>
		</Col>
	);
};
export default Options;

const Col = styled(FlexDivColCentered)`
	width: 400px;
`;

const InfoCard = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	margin-bottom: 16px;
	padding: 16px;
	width: 100%;
`;

const Row = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	border-bottom: 0.5px solid ${(props) => props.theme.colors.grayBlue};
	justify-content: space-between;
	padding: 8px;
`;

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	text-transform: uppercase;
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
	color: ${(props) => props.theme.colors.blue};
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
`;

const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.gray};
`;

const DateSelector = styled.div``;

const BlockInput = styled(Input)``;
