import { SynthetixJS } from '@synthetixio/contracts-interface';
import Connector from 'containers/Connector';
import { ethers } from 'ethers';

export type SynthetixJsAndSignerProps = {
  synthetixjs: { contracts: SynthetixJS['contracts'] };
  signer: ethers.Signer;
};

type PropsWithoutInjected<TBaseProps> = Omit<TBaseProps, keyof SynthetixJsAndSignerProps>;

export function withSynthetixJsAndSigner<TProps>(
  WrappedComponent: React.ComponentType<PropsWithoutInjected<TProps> & SynthetixJsAndSignerProps>
) {
  const Comp: React.FC<PropsWithoutInjected<TProps>> = (props) => {
    const { signer, synthetixjs } = Connector.useContainer();
    if (!signer || !synthetixjs) return null;

    return <WrappedComponent {...props} signer={signer} synthetixjs={synthetixjs} />;
  };
  const originalComponentName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  Comp.displayName = `withSynthetixJsAndSigner${originalComponentName}`;
  return Comp;
}
