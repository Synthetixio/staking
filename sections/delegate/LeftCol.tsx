import { useState, useMemo, useEffect, FC } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import Button from 'components/Button';
import StructuredTab from 'components/StructuredTab';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	NoTextTransform,
	IconButton,
	FlexDivRowCentered,
} from 'styles/common';
import { Svg } from 'react-optimized-image';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import GasSelector from 'components/GasSelector';
import { LEFT_COL_WIDTH } from 'sections/delegate/constants';
import { toBig, toFixed } from 'utils/formatters/big-number';
import {
	FormContainer,
	InputsContainer,
	SettingsContainer,
	SettingContainer,
	ErrorMessage,
	TxModalItem,
} from 'sections/delegate/common';
import { getGasEstimateForTransaction } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

const LeftCol: FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('delegate.form.title'),
				tabChildren: <Tab />,
				key: 'main',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab
			singleTab={true}
			boxPadding={20}
			boxWidth={LEFT_COL_WIDTH}
			tabData={tabData}
			setPanelType={() => null}
		/>
	);
};

const Tab: FC = () => {
	const { t } = useTranslation();
	const router = useRouter();

	const [buttonState] = useState<string>('');
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);
	const [delegateAddress, setDelegateAddress] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const shortenedDelegateAddress = useMemo(
		() => `${delegateAddress.slice(0, 8)}....${delegateAddress.slice(-6)}`,
		[delegateAddress]
	);

	const onGoBack = () => router.back();
	const onEnterAddress = (e: any) => setDelegateAddress((e.target.value ?? '').trim());
	const onButtonClick = async () => {};

	return (
		<>
			<FormContainer>
				<Header>
					<IconButton onClick={onGoBack}>
						<Svg src={NavigationBack} />
					</IconButton>
				</Header>

				<InputsContainer>
					<AmountInput
						value={delegateAddress}
						placeholder={t('delegate.form.input-placeholder')}
						onChange={onEnterAddress}
						disabled={false}
						rows={3}
						autoComplete={'off'}
					/>
				</InputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<GasSelector gasLimitEstimate={gasLimit} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={onButtonClick}
				variant="primary"
				size="lg"
				disabled={!delegateAddress || !!buttonState}
			>
				<Trans
					i18nKey={`delegate.form.button-labels.${
						buttonState || (!delegateAddress ? 'enter-address' : 'delegate')
					}`}
					components={[<NoTextTransform />]}
				/>
			</FormButton>

			{!error ? null : <ErrorMessage>{error}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={onButtonClick}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('delegate.form.tx-confirmation-title')}</TxModalItemTitle>
							<TxModalItemText>{shortenedDelegateAddress}</TxModalItemText>
						</TxModalItem>
					}
				/>
			)}
		</>
	);
};

const Header = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

const AmountInput = styled.textarea`
	padding: 0;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 15px;
	overflow: hidden;
	resize: none;
	color: white;
	border: none;
	outline: none;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

const FormButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default LeftCol;
