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
import { Account } from 'queries/delegate/types';
import { walletAddressState, networkState } from 'store/wallet';
import { Action, ACTIONS } from 'queries/delegate/types';
import { fromBytes32 } from 'utils/transactions';

type Context = {
	accounts: Account[];
	isLoading: boolean;
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

	const [isLoading, setIsLoading] = useState(false);
	const [accounts, setAccounts] = useState<Array<Account>>([]);

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
			return ~actionId ? ACTIONS[actionId] : null;
		},
		[actionsAsBytes]
	);

	const kovan = network!?.name === 'kovan';
	// todo: put in a config
	const subgraphUrl = kovan
		? 'https://api.thegraph.com/subgraphs/name/vbstreetz/delegate-approvals-kovan'
		: 'https://api.thegraph.com/subgraphs/name/vbstreetz/delegate-approvals';

	const subgraph = useCallback(
		(query: any, variables: any) => makeSubgraph(subgraphUrl)(query, variables),
		[subgraphUrl]
	);

	useEffect(() => {
		if (!(delegateApprovalsContract && address)) return;

		let isMounted = true;
		const unsubs: Array<any> = [() => (isMounted = false)];

		const load = async () => {
			setIsLoading(true);

			const { accounts } = await subgraph(
				`query (
					$authoriser: String!
				) {
          accounts(where: {
						authoriser: $authoriser
					}) {
						authoriser
						delegate
						mint
						burn
						claim
						exchange
          }
        }`,
				{
					authoriser: address,
				}
			);

			if (isMounted) {
				setAccounts(
					accounts.map(
						({ authoriser, delegate, mint, burn, claim, exchange }: Account) =>
							new Account(authoriser, delegate, mint, burn, claim, exchange)
					)
				);
				setIsLoading(false);
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

		const updateAccount = (
			bool: boolean,
			authoriser: string,
			delegate: string,
			action32: string
		) => {
			setAccounts((a) => {
				const action: string = fromBytes32(action32);
				const accounts = a.slice();
				let entity = accounts.find(
					(e) =>
						ethers.utils.getAddress(e.authoriser) === authoriser &&
						ethers.utils.getAddress(e.delegate) === delegate
				);
				if (!entity) {
					entity = new Account(authoriser, delegate, false, false, false, false);
					accounts.push(entity!);
				}
				if (0 === action.localeCompare(Action.APPROVE_ALL)) {
					entity.burn = bool;
					entity.mint = bool;
					entity.claim = bool;
					entity.exchange = bool;
				} else if (0 === action.localeCompare(Action.BURN_FOR_ADDRESS)) {
					entity.burn = bool;
				} else if (0 === action.localeCompare(Action.ISSUE_FOR_ADDRESS)) {
					entity.mint = bool;
				} else if (0 === action.localeCompare(Action.CLAIM_FOR_ADDRESS)) {
					entity.claim = bool;
				} else if (0 === action.localeCompare(Action.EXCHANGE_FOR_ADDRESS)) {
					entity.exchange = bool;
				}

				return accounts;
			});
		};

		const onApproval = (authoriser: string, delegate: string, action: string) => {
			updateAccount(true, authoriser, delegate, action);
		};

		const onWithdrawApproval = (authoriser: string, delegate: string, action: string) => {
			updateAccount(false, authoriser, delegate, action);
		};

		load();
		subscribe();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [delegateApprovalsContract, subgraph, address]);

	return (
		<DelegatesContext.Provider
			value={{
				accounts,
				isLoading,
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

const makeSubgraph = (subgraphUrl: string) => async (query: any, variables: any) => {
	const res = await fetch(subgraphUrl, {
		method: 'POST',
		body: JSON.stringify({ query, variables }),
	});
	const { data } = await res.json();
	return data;
};
