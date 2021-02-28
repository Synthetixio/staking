import { useState, useMemo, useEffect, FC } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import Big from 'bignumber.js';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import Button from 'components/Button';
import { NoTextTransform } from 'styles/common';
import { Svg } from 'react-optimized-image';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import { IconButton, FlexDivRowCentered } from 'styles/common';
import GasSelector from 'components/GasSelector';
import { useLoans } from 'sections/loans/contexts/loans';
import { toBig } from 'utils/formatters/big-number';
import {
	FormContainer,
	InputsContainer,
	InputsDivider,
	SettingsContainer,
	SettingContainer,
} from 'sections/loans/components/common';
import { getGasEstimateForTransaction } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import AssetInput from 'sections/loans/components/ActionBox/BorrowSynthsTab/AssetInput';
import { Loan } from 'queries/loans/types';
import AccruedInterest from 'sections/loans/components/ActionBox/components/AccruedInterest';
import CRatio from 'sections/loans/components/ActionBox/components/LoanCRatio';

type WrapperProps = {
	getTxData: (gas: Record<string, number>) => any[] | null;

	aLabel: string;
	aAsset: string;
	aAmountNumber: string;
	onSetAAmount?: (amount: string) => void;
	onSetAMaxAmount?: (amount: string) => void;

	bLabel: string;
	bAsset: string;
	bAmountNumber: string;
	onSetBAmount?: (amount: string) => void;
	onSetBMaxAmount?: (amount: string) => void;

	buttonLabel: string;
	buttonIsDisabled: boolean;
	onButtonClick: (gas: Record<string, number>) => void;

	loan: Loan;
	loanTypeIsETH: boolean;

	showCRatio?: boolean;
	showInterestAccrued?: boolean;
};

const Wrapper: FC<WrapperProps> = ({
	getTxData,

	aLabel,
	aAsset,
	aAmountNumber,
	onSetAAmount,
	onSetAMaxAmount,

	bLabel,
	bAsset,
	bAmountNumber,
	onSetBAmount,
	onSetBMaxAmount,

	buttonLabel,
	buttonIsDisabled,
	onButtonClick,

	loan,
	loanTypeIsETH,

	showCRatio,
	showInterestAccrued,
}) => {
	const router = useRouter();
	const { interactionDelays } = useLoans();

	const [waitETA, setWaitETA] = useState<string>('');

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const onGoBack = () => router.back();
	const onSetAAsset = () => {};
	const onSetBAsset = () => {};

	const nextInteractionDate = useMemo(() => {
		const loanType = loanTypeIsETH ? 'eth' : 'erc20';
		if (!(interactionDelays && loanType in interactionDelays)) return;
		const interactionDelay = interactionDelays[loanType];
		return moment
			.unix(parseInt(loan.lastInteraction.toString()))
			.add(parseInt(interactionDelay.toString()), 'seconds');
	}, [loanTypeIsETH, loan.lastInteraction, interactionDelays]);

	useEffect(() => {
		if (!nextInteractionDate) return;

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

		const timer = () => {
			const intervalId = setInterval(() => {
				const now = moment.utc();
				if (now.isAfter(nextInteractionDate)) {
					return stopTimer();
				}
				if (isMounted) {
					setWaitETA(toHumanizedDuration(toBig(nextInteractionDate.diff(now, 'seconds'))));
				}
			}, 1000);

			const stopTimer = () => {
				if (isMounted) {
					setWaitETA('');
				}
				clearInterval(intervalId);
			};

			unsubs.push(stopTimer);
		};

		timer();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [nextInteractionDate]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const data: any[] | null = getTxData({});
				if (!data) return;
				const [contract, method, args] = data;
				const gasEstimate = await getGasEstimateForTransaction(args, contract.estimateGas[method]);
				if (isMounted) setGasLimitEstimate(getNormalizedGasLimit(Number(gasEstimate)));
			} catch (error) {
				// console.error(error);
				if (isMounted) setGasLimitEstimate(null);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [getTxData]);

	return (
		<>
			<FormContainer>
				<Header>
					<IconButton onClick={onGoBack}>
						<Svg src={NavigationBack} />
					</IconButton>
				</Header>

				<InputsContainer>
					<AssetInput
						label={aLabel}
						asset={aAsset}
						setAsset={onSetAAsset}
						amount={aAmountNumber}
						setAmount={onSetAAmount || noop}
						assets={[aAsset]}
						selectDisabled={true}
						inputDisabled={!onSetAAmount}
						onSetMaxAmount={onSetAMaxAmount}
					/>
					<InputsDivider />
					<AssetInput
						label={bLabel}
						asset={bAsset}
						setAsset={onSetBAsset}
						amount={bAmountNumber}
						setAmount={onSetBAmount || noop}
						assets={[bAsset]}
						selectDisabled={true}
						inputDisabled={!onSetBAmount}
						onSetMaxAmount={onSetBMaxAmount}
					/>
				</InputsContainer>

				<SettingsContainer>
					{!showCRatio ? null : (
						<SettingContainer>
							<CRatio {...{ loan, loanTypeIsETH }} />
						</SettingContainer>
					)}
					{!showInterestAccrued ? null : (
						<SettingContainer>
							<AccruedInterest {...{ loan }} />
						</SettingContainer>
					)}
					<SettingContainer>
						<GasSelector gasLimitEstimate={gasLimit} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={() =>
					onButtonClick({ gasPrice: getNormalizedGasPrice(gasPrice), gasLimit: gasLimit! })
				}
				variant="primary"
				size="lg"
				disabled={!!waitETA || buttonIsDisabled}
			>
				<Trans
					i18nKey={waitETA ? 'loans.modify-loan.loan-interation-delay' : buttonLabel}
					values={{ waitETA }}
					components={[<NoTextTransform />]}
				/>
			</FormButton>
		</>
	);
};

function noop() {}

function toHumanizedDuration(ms: Big) {
	const dur: Record<string, Big> = {};
	const units: Array<any> = [
		{ label: 's', mod: 60 },
		{ label: 'm', mod: 60 },
		// { label: 'h', mod: 24 },
		// { label: 'd', mod: 31 },
		// {label: "w", mod: 7},
	];
	units.forEach((u) => {
		const z = (dur[u.label] = ms.mod(u.mod));
		ms = ms.minus(z).dividedBy(u.mod);
	});
	return units
		.reverse()
		.filter((u) => {
			return u.label !== 'ms'; // && dur[u.label]
		})
		.map((u) => {
			let val = dur[u.label].toString();
			if (u.label === 'm' || u.label === 's') {
				val = val.padStart(2, '0');
			}
			return val + u.label;
		})
		.join(':');
}

const Header = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

const FormButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default Wrapper;
