import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import InfoIcon from 'assets/svg/app/info.svg';

import Button from 'components/Button';

import { NumericValue, FlexDivRowCentered, FlexDivRow } from 'styles/common';

import { formatPercent } from 'utils/formatters/number';
import NumericInput from 'components/Input/NumericInput';

type BufferSelectorProps = {
	setBuffer: (num: string) => void;
	buffer: string;
};

const BufferSelector: React.FC<BufferSelectorProps> = ({ buffer, setBuffer, ...rest }) => {
	const { t } = useTranslation();

	const [customBuffer, setCustomBuffer] = useState<string>('');

	const BUFFER_VALUES = useMemo(
		() => [
			{
				text: t('common.buffer.low'),
				value: '0.0010',
			},
			{
				text: t('common.buffer.medium'),
				value: '0.0025',
			},
			{
				text: t('common.buffer.high'),
				value: '0.0050',
			},
		],
		[t]
	);

	const hasCustomBuffer = customBuffer !== '';

	const bufferItem = hasCustomBuffer ? (
		<span data-testid="gas-price">{formatPercent(customBuffer)}</span>
	) : (
		<span data-testid="gas-price">{formatPercent(buffer)}</span>
	);

	const content = (
		<BufferSelectContainer>
			<div>
				<CustomSlippage
					value={customBuffer}
					onChange={(_, value) => {
						setBuffer(value);
						setCustomBuffer(value);
					}}
					placeholder={t('common.custom')}
				/>
			</div>
			{BUFFER_VALUES.map(({ text, value }) => (
				<StyledBufferButton
					key={text}
					variant="solid"
					onClick={() => {
						setCustomBuffer('');
						setBuffer(value);
					}}
					isActive={hasCustomBuffer ? false : buffer === value}
				>
					<BufferText>{text}</BufferText>
					<NumericValue>{formatPercent(value)}</NumericValue>
				</StyledBufferButton>
			))}
		</BufferSelectContainer>
	);

	return (
		<Container {...rest}>
			<FlexDivRowCentered>
				<BufferHeader>{t('common.buffer.title')}</BufferHeader>
				<BufferHelperTooltip content={<span>{t('common.buffer.helper')}</span>} arrow={false}>
					<InfoIconWrapper>
						<Svg src={InfoIcon} />
					</InfoIconWrapper>
				</BufferHelperTooltip>
			</FlexDivRowCentered>
			<FlexDivRowCentered>
				<BufferItem>
					<BufferText>{bufferItem}</BufferText>
				</BufferItem>
				<BufferTooltip trigger="click" arrow={false} content={content} interactive={true}>
					<StyledBufferEditButton role="button">{t('common.edit')}</StyledBufferEditButton>
				</BufferTooltip>
			</FlexDivRowCentered>
		</Container>
	);
};
export default BufferSelector;

const Container = styled(FlexDivRow)`
	width: 100%;
	justify-content: space-between;
`;

const BufferHeader = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

const BufferSelectContainer = styled.div`
	padding: 16px 0 8px 0;
`;

const BufferHelperTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.navy};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
	.tippy-content {
		padding: 0;
	}
`;

const BufferTooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.navy};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 120px;
`;

const CustomSlippage = styled(NumericInput)`
	width: 100%;
	border: 0;
	font-size: 12px;
	::placeholder {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`;

const BufferText = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const BufferItem = styled.span`
	display: inline-flex;
	align-items: center;
	svg {
		margin-left: 5px;
	}
`;

const StyledBufferButton = styled(Button)`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 10px;
	padding-right: 10px;
	font-size: 12px;
`;

const InfoIconWrapper = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

const StyledBufferEditButton = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	padding-left: 5px;
	font-size: 12px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.blue};
	text-transform: uppercase;
`;
