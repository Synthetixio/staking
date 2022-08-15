import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Connector from 'containers/Connector';
import { wei } from '@synthetixio/wei';

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
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));

  const handleSetMaxAmount = () => {
    if (onSetMaxAmount && balance) {
      onSetMaxAmount(ethers.utils.formatUnits(balance, 18));
    }
  };

  useEffect(() => {
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
        {t('balance.input-label')} {wei(balance).toString(2)}{' '}
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
  const { synthetixjs, walletAddress } = Connector.useContainer();

  const [balance, setBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [decimals, setDecimals] = useState<number>(0);

  const handleSetMaxAmount = () => {
    if (onSetMaxAmount && balance && decimals) {
      onSetMaxAmount(ethers.utils.formatUnits(balance, decimals));
    }
  };

  const contract = useMemo(() => {
    if (!synthetixjs) return null;
    const {
      contracts: { ProxysBTC: sBTC, ProxysETH: sETH, ProxyERC20sUSD: sUSD },
    } = synthetixjs;
    const tokens: Record<string, typeof sBTC> = {
      sBTC,
      sETH,
      sUSD,
    };
    return tokens[asset];
  }, [asset, synthetixjs]);

  useEffect(() => {
    if (!(contract && walletAddress)) return;

    let isMounted = true;
    const unsubs: Array<any> = [() => (isMounted = false)];

    const loadBalance = async () => {
      const [decimals, balance] = await Promise.all([
        contract.decimals(),
        contract.balanceOf(walletAddress),
      ]);
      if (isMounted) {
        setDecimals(decimals);
        setBalance(balance);
      }
    };

    const subscribe = () => {
      const transferEvent = contract.filters.Transfer();
      const onBalanceChange = async (from: string, to: string) => {
        if (from === walletAddress || to === walletAddress) {
          if (isMounted) setBalance(await contract.balanceOf(walletAddress));
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
  }, [contract, walletAddress]);

  return !(decimals && balance) ? null : (
    <Container>
      {t('balance.input-label')} {wei(balance, decimals).toString(2)}{' '}
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
  color: ${(props) => props.theme.colors.gray};
`;

const StyleMaxButton = styled.div`
  color: ${(props) => props.theme.colors.blue};
  cursor: pointer;
  margin-left: 5px;
  text-transform: uppercase;
`;
