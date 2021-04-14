import React from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import synthetix from 'lib/synthetix';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import { formatUnits } from 'utils/formatters/number';
import Loans from 'containers/Loans';

type BalanceProps = {
	asset: string;
	onSetMaxAmount?: (amount: string) => void;
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
	onSetMaxAmount?: (amount: string) => void;
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
		const unsubs: Array<any> = [() => (isMounted = false)];

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
			unsubs.forEach((unsub) => unsub());
		};
	}, [signer, provider]);

	return (
		balance && (
			<Container>
				{t('balance.input-label')} {formatUnits(balance, 18, 2)}{' '}
				{!onSetMaxAmount ? null : <MaxButton onClick={handleSetMaxAmount} />}
			</Container>
		)
	);
};

type ERC20Props = {
	asset: string;
	onSetMaxAmount?: (amount: string) => void;
};

const ERC20: React.FC<ERC20Props> = ({ asset, onSetMaxAmount }) => {
	const { t } = useTranslation();
	const address = useRecoilValue(walletAddressState);
	const [balance, setBalance] = React.useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
	const [decimals, setDecimals] = React.useState<number>(0);
	const { renBTCContract } = Loans.useContainer();

	const handleSetMaxAmount = () => {
		if (onSetMaxAmount && balance && decimals) {
			onSetMaxAmount(ethers.utils.formatUnits(balance, decimals));
		}
	};

	const contract = React.useMemo(() => {
		const {
			contracts: { ProxysBTC: sBTC, ProxysETH: sETH, ProxyERC20sUSD: sUSD },
		} = synthetix.js!;
		const tokens: Record<string, ethers.Contract> = { sBTC, sETH, sUSD, renBTC: renBTCContract! };
		return tokens[asset];
	}, [asset, renBTCContract]);

	React.useEffect(() => {
		if (!(contract && address)) return;

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

		const loadBalance = async () => {
			const [decimals, balance] = await Promise.all([
				contract.decimals(),
				contract.balanceOf(address),
			]);
			if (isMounted) {
				setDecimals(decimals);
				setBalance(balance);
			}
		};

		const subscribe = () => {
			const transferEvent = contract.filters.Transfer();
			const onBalanceChange = async (from: string, to: string) => {
				if (from === address || to === address) {
					if (isMounted) setBalance(await contract.balanceOf(address));
				}
			};

			contract.on(transferEvent, onBalanceChange);
			unsubs.push(() => contract.off(transferEvent, onBalanceChange));
		};

		loadBalance();
		subscribe();
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [contract, address]);

	return !(decimals && balance) ? null : (
		<Container>
			{t('balance.input-label')} {formatUnits(balance, decimals, 2)}{' '}
			{!onSetMaxAmount ? null : <MaxButton onClick={handleSetMaxAmount} />}
		</Container>
	);
};

type MaxButtonProps = {
	onClick: () => void;
};

const MaxButton: React.FC<MaxButtonProps> = ({ onClick }) => {
	const { t } = useTranslation();
	return <StyleMaxButton {...{ onClick }}>{t('balance.max')}</StyleMaxButton>;
};

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
	text-transform: uppercase;
`;
