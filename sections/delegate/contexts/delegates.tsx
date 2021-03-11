import {
	useMemo,
	useEffect,
	useState,
	createContext,
	useContext,
	ReactNode,
	useCallback,
} from 'react';
import { ethers } from 'ethers';
import { appReadyState } from 'store/app';
import { useRecoilValue } from 'recoil';
import synthetix from 'lib/synthetix';
import { DelegateApproval } from 'queries/delegate/types';
import { walletAddressState, networkState } from 'store/wallet';
import { ACTIONS, ACTION_KEYS } from 'queries/delegate/types';

type Context = {
	delegateApprovals: DelegateApproval[];
	isLoadingDelegates: boolean;
	delegateApprovalsContract: ethers.Contract | null;
	getActionByBytes: (bytes: string) => string | null;
};

const DelegatesContext = createContext<Context | null>(null);

type DelegatesProviderProps = {
	children: ReactNode;
};

export const DelegatesProvider: React.FC<DelegatesProviderProps> = ({ children }) => {
	const address = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const isAppReady = useRecoilValue(appReadyState);

	const [isLoadingDelegates, setIsLoadingDelegates] = useState(false);
	const [delegateApprovals, setDelegateApprovals] = useState<Array<DelegateApproval>>([]);

	const delegateApprovalsContract = useMemo(() => {
		if (!(isAppReady && synthetix.js && address)) return null;
		const {
			contracts: { DelegateApprovals },
		} = synthetix.js;
		return DelegateApprovals;
	}, [isAppReady, address]);

	const actionsAsBytes = useMemo(
		() => (!(isAppReady && synthetix.js) ? [] : ACTIONS.map(synthetix.js.toBytes32)),
		[isAppReady]
	);

	const getActionByBytes = useCallback(
		(bytes) => {
			const actionId = actionsAsBytes.indexOf(bytes);
			return ~actionId ? ACTION_KEYS[actionId] : null;
		},
		[actionsAsBytes]
	);

	const kovan = network!?.name === 'kovan';
	// todo: put in a config
	const delegateApprovalsSubgraphUrl = kovan
		? 'https://api.thegraph.com/subgraphs/name/vbstreetz/delegate-approvals-kovan'
		: 'https://api.thegraph.com/subgraphs/name/vbstreetz/delegate-approvals';

	const subgraph = (subgraphUrl: string) => async (query: any, variables: any) => {
		const res = await fetch(subgraphUrl, {
			method: 'POST',
			body: JSON.stringify({ query, variables }),
		});
		const { data } = await res.json();
		return data;
	};

	const delegateApprovalsSubgraph = useCallback(
		(query: any, variables: any) => subgraph(delegateApprovalsSubgraphUrl)(query, variables),
		[delegateApprovalsSubgraphUrl]
	);

	useEffect(() => {
		if (!(delegateApprovalsContract && address)) return;

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

		const load = async () => {
			setIsLoadingDelegates(true);

			const { delegateApprovals } = await delegateApprovalsSubgraph(
				`query ($authoriser: String!, $withdrawn: Boolean) {
          delegateApprovals(where: {authoriser: $authoriser, withdrawn: $withdrawn}) {
            delegate
						action
          }
        }`,
				{
					authoriser: address,
					withdrawn: false,
				}
			);

			if (isMounted) {
				setDelegateApprovals(delegateApprovals);
				setIsLoadingDelegates(false);
			}
		};

		const subscribe = () => {
			const approvalEvent = delegateApprovalsContract.filters.Approval(address);
			const withdrawApprovalEvent = delegateApprovalsContract.filters.WithdrawApproval(address);
			unsubs.push(() => delegateApprovalsContract.off(approvalEvent, onApproval));
			unsubs.push(() => delegateApprovalsContract.off(withdrawApprovalEvent, onWithdrawApproval));
			delegateApprovalsContract.on(approvalEvent, onApproval);
			delegateApprovalsContract.on(withdrawApprovalEvent, onWithdrawApproval);
		};

		const onApproval = (authoriser: string, delegate: string, action: string) => {
			setDelegateApprovals((delegateApprovals) => [
				{ authoriser, delegate, action },
				...delegateApprovals,
			]);
		};

		const onWithdrawApproval = (authoriser: string, delegate: string, action: string) => {
			setDelegateApprovals((delegateApprovals) =>
				delegateApprovals.filter(
					(delegateApproval) =>
						!(
							ethers.utils.getAddress(delegateApproval.delegate) ===
								ethers.utils.getAddress(delegate) && delegateApproval.action === action
						)
				)
			);
		};

		load();
		subscribe();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [delegateApprovalsContract, delegateApprovalsSubgraph, address]);

	return (
		<DelegatesContext.Provider
			value={{
				delegateApprovals,
				isLoadingDelegates,
				delegateApprovalsContract,
				getActionByBytes,
			}}
		>
			{children}
		</DelegatesContext.Provider>
	);
};

export function useDelegates() {
	const context = useContext(DelegatesContext);
	if (!context) {
		throw new Error('Missing delegates context');
	}
	return context;
}
