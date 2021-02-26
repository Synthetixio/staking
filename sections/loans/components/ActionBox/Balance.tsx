import React from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import synthetix from 'lib/synthetix';
import { appReadyState } from 'store/app';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import { formatUnits } from 'utils/formatters/big-number';

type BalanceProps = {
	asset: string;
	onSetMaxAmount?: (amount: string) => string;
};

const Balance: React.FC<BalanceProps> = ({ asset, onSetMaxAmount }) => {
	const { signer } = Connector.useContainer();
	return !signer ? null : asset === 'ETH' ? (
		<ETH {...{ onSetMaxAmount }} />
	) : (
		<ERC20 {...{ asset, onSetMaxAmount }} />
	);
};

export default Balance;

type ETHProps = {
	onSetMaxAmount?: (amount: string) => string;
};

const ETH: React.FC<ETHProps> = ({ onSetMaxAmount }) => {
	const { t } = useTranslation();
	const { provider, signer } = Connector.useContainer();
	const [balance, setBalance] = React.useState(ethers.BigNumber.from('0'));

	const handleSetMaxAmount = () => {
		if (onSetMaxAmount && balance) {
			onSetMaxAmount(ethers.utils.formatUnits(balance, 18));
		}
	};

	React.useEffect(() => {
		if (!signer) return;

		let isMounted = true;
		const unsubs: Array<any> = [];

		const onSetBalance = async () => {
			const balance = await signer.getBalance();
			if (isMounted) setBalance(balance);
		};

		const subscribe = () => {
			if (provider) {
				const newBlockEvent = 'block';
				provider.on(newBlockEvent, onSetBalance);
				unsubs.push(() => provider.off(newBlockEvent, onSetBalance));
			}
		};

		onSetBalance();
		subscribe();
		return () => {
			isMounted = false;
			unsubs.forEach((unsub) => unsub());
		};
	}, [signer]);

	return (
		balance && (
			<Container>
				{t('loans.balance-input-label')} {formatUnits(balance, 18, 2)}{' '}
				{!onSetMaxAmount ? null : <MaxButton onClick={handleSetMaxAmount} />}
			</Container>
		)
	);
};

type ERC20Props = {
	asset: string;
	onSetMaxAmount?: (amount: string) => string;
};

const ERC20: React.FC<ERC20Props> = ({ asset, onSetMaxAmount }) => {
	const { t } = useTranslation();
	const address = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);
	const [balance, setBalance] = React.useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
	const [decimals, setDecimals] = React.useState<number>(0);

	const handleSetMaxAmount = () => {
		if (onSetMaxAmount && balance && decimals) {
			onSetMaxAmount(ethers.utils.formatUnits(balance, decimals));
		}
	};

	const contract = React.useMemo(() => {
		if (isAppReady) {
			const {
				contracts: { ProxysBTC: sBTC, ProxysETH: sETH, ProxyERC20sUSD: sUSD },
			} = synthetix.js!;
			const tokens: Record<string, ethers.Contract> = { sBTC, sETH, sUSD };
			return tokens[asset];
		}
	}, [asset, isAppReady]);

	React.useEffect(() => {
		if (!(contract && address)) return;

		let isMounted = true;
		const unsubs: Array<any> = [];

		const loadBalance = async () => {
			const [decimals, balance] = await Promise.all([
				contract.decimals(),
				contract.balanceOf(address),
			]);
			setDecimals(decimals);
			setBalance(balance);
		};

		const subscribe = () => {
			const transferEvent = contract.filters.Transfer();
			const onBalanceChange = async (from: string, to: string) => {
				if (from === address || to === address) {
					await sleep(1000);
					if (isMounted) setBalance(await contract.balanceOf(address));
				}
			};

			contract.on(transferEvent, onBalanceChange);
			unsubs.push(() => contract.off(transferEvent, onBalanceChange));
		};

		loadBalance();
		subscribe();
		return () => {
			isMounted = false;
			unsubs.forEach((unsub) => unsub());
		};
	}, [contract, address]);

	return !(decimals && balance) ? null : (
		<Container>
			{t('loans.balance-input-label')} {formatUnits(balance, decimals, 2)}{' '}
			{!onSetMaxAmount ? null : <MaxButton onClick={handleSetMaxAmount} />}
		</Container>
	);
};

type MaxButtonProps = {
	onClick: () => void;
};

const MaxButton: React.FC<MaxButtonProps> = ({ onClick }) => {
	return <StyleMaxButton {...{ onClick }}>MAX</StyleMaxButton>;
};

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

const Container = styled.div`
	display: flex;
	font-size: 12px;
	margin-top: 14px;
	color: ${(props) => props.theme.colors.gray};
`;

const StyleMaxButton = styled.div`
	color: ${(props) => props.theme.colors.blue};
	cursor: pointer;
	margin-left: 5px;
`;
