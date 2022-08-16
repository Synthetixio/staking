import { createContainer } from 'unstated-next';
import { useMemo, useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';

import Connector from 'containers/Connector';
import { sleep } from 'utils/promise';
import getOpenLoans from './getOpenLoans';
import { Loan } from './types';
import getLoan from './getLoan';

import useSynthetixQueries from '@synthetixio/queries';
import { useQuery } from 'react-query';
import { wei } from '@synthetixio/wei';

const SECONDS_IN_A_YR = 365 * 24 * 60 * 60;

function Container() {
  const { provider, signer, synthetixjs, isAppReady, walletAddress, network, isL2 } =
    Connector.useContainer();

  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);

  const [pendingWithdrawals, setPendingWithdrawals] = useState(BigNumber.from('0'));
  const { subgraph } = useSynthetixQueries();
  const [ethLoanContract, ethLoanStateContract, collateralManagerContract] = useMemo(() => {
    if (!(isAppReady && synthetixjs && signer && walletAddress)) return [null, null, null];
    const {
      contracts: {
        CollateralEth: ethLoanContract,
        CollateralStateEth: ethLoanStateContract,
        CollateralManager: collateralManagerContract,
      },
    } = synthetixjs;
    return [ethLoanContract, ethLoanStateContract, collateralManagerContract];
  }, [isAppReady, signer, synthetixjs, walletAddress]);

  const minCratioQuery = useQuery(
    'minCratio',
    async () => {
      if (!ethLoanContract) return wei(0);
      const minCratio = await ethLoanContract.minCratio();
      return wei(minCratio);
    },
    { enabled: Boolean(ethLoanContract) }
  );

  const subgraphOpenLoansQuery = subgraph.useGetLoans(
    { where: { isOpen: true, account: walletAddress } },
    { id: true, collateralMinted: true },
    { queryKey: ['getLoans', isL2, walletAddress] }
  );

  const subgraphOpenLoansKey = subgraphOpenLoansQuery.data
    ? JSON.stringify(
        subgraphOpenLoansQuery.data.map((x) => {
          const id = x.id.replace(/-\w+/, ''); //remove -sETH from id
          return { ...x, id };
        })
      )
    : '';

  useEffect(() => {
    if (!(isAppReady && walletAddress && provider && ethLoanContract)) {
      return;
    }

    let isMounted = true;
    const unsubs: Array<Function> = [
      () => {
        isMounted = false;
      },
    ];
    const loadLoans = async () => {
      setIsLoadingLoans(true);
      const openLoans = await getOpenLoans({
        ethLoanContract,
        ethLoanStateContract,
        address: walletAddress,
        isL2,
        subgraphOpenLoans: subgraphOpenLoansKey ? JSON.parse(subgraphOpenLoansKey) : [],
      });
      if (isMounted) {
        setLoans(openLoans);
        setIsLoadingLoans(false);
      }
    };

    // subscribe to loan open+close
    const subscribe = () => {
      const loanContract = ethLoanContract;
      const loanStateContract = ethLoanStateContract;
      if (!loanContract) return;

      const updateLoan = async (owner: string, id: BigNumber) => {
        const loan = await getLoan({
          id: id.toNumber(),
          loanContract,
          loanStateContract: ethLoanStateContract || null,
          isL2,
          address: walletAddress,
        });
        setLoans((originalLoans) => {
          const loans = originalLoans.slice();
          const idx = loans.findIndex((l) => l.id.eq(id));
          if (~idx) {
            loans[idx] = loan;
          } else {
            console.warn(`unknown loan(id=${id.toString()}, owner=${owner.toString()})`);
          }
          return loans;
        });
      };

      const onLoanCreated = async (_address: string, id: BigNumber) => {
        const loan = await getLoan({
          id: id.toNumber(),
          loanContract,
          loanStateContract,
          isL2,
          address: walletAddress,
        });
        setLoans((loans) => [loan, ...loans]);
      };

      const onLoanClosed = (_owner: string, id: BigNumber) => {
        setLoans((loans) => loans.filter((loan) => !loan.id.eq(id)));
      };

      const onCollateralDeposited = async (owner: string, id: BigNumber, amount: BigNumber) => {
        setLoans((loans) =>
          loans.map((loan) => {
            if (loan.id.eq(id)) {
              return { ...loan, collateral: loan.collateral.add(amount) };
            }
            return loan;
          })
        );
        await updateLoan(owner, id);
      };

      const onCollateralWithdrawn = async (owner: string, id: BigNumber, amount: BigNumber) => {
        setLoans((loans) =>
          loans.map((loan) => {
            if (loan.id.eq(id)) {
              loan.collateral = loan.collateral.sub(amount);
            }
            return loan;
          })
        );
        await updateLoan(owner, id);
      };

      const onLoanRepaymentMade = async (
        borrower: string,
        _repayer: string,
        id: BigNumber,
        payment: BigNumber
      ) => {
        setLoans((loans) =>
          loans.map((loan) => {
            if (loan.id.eq(id)) {
              return { ...loan, amount: loan.amount.sub(payment) };
            }
            return loan;
          })
        );
        await updateLoan(borrower, id);
      };

      const onLoanDrawnDown = async (owner: string, id: BigNumber, amount: BigNumber) => {
        setLoans((loans) =>
          loans.map((loan) => {
            if (loan.id.eq(id)) {
              return { ...loan, amount: loan.amount.add(amount) };
            }
            return loan;
          })
        );
        await updateLoan(owner, id);
      };

      const loanCreatedEvent = loanContract.filters.LoanCreated(walletAddress);
      const loanClosedEvent = loanContract.filters.LoanClosed(walletAddress);
      const collateralDepositedEvent = loanContract.filters.CollateralDeposited(walletAddress);
      const collateralWithdrawnEvent = loanContract.filters.CollateralWithdrawn(walletAddress);
      const loanDrawnDownEvent = loanContract.filters.LoanDrawnDown(walletAddress);
      const loanRepaymentMadeEvent = loanContract.filters.LoanRepaymentMade(walletAddress);

      loanContract.on(loanCreatedEvent, onLoanCreated);
      loanContract.on(loanClosedEvent, onLoanClosed);
      loanContract.on(collateralDepositedEvent, onCollateralDeposited);
      loanContract.on(collateralWithdrawnEvent, onCollateralWithdrawn);
      loanContract.on(loanDrawnDownEvent, onLoanDrawnDown);
      loanContract.on(loanRepaymentMadeEvent, onLoanRepaymentMade);

      unsubs.push(() => loanContract.off(loanCreatedEvent, onLoanCreated));
      unsubs.push(() => loanContract.off(loanClosedEvent, onLoanClosed));
      unsubs.push(() => loanContract.off(collateralDepositedEvent, onCollateralDeposited));
      unsubs.push(() => loanContract.off(collateralWithdrawnEvent, onCollateralWithdrawn));
      unsubs.push(() => loanContract.off(loanDrawnDownEvent, onLoanDrawnDown));
      unsubs.push(() => loanContract.off(loanRepaymentMadeEvent, onLoanRepaymentMade));
    };

    loadLoans();
    subscribe();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [
    isAppReady,
    walletAddress,
    provider,
    ethLoanContract,
    ethLoanStateContract,
    isL2,
    network,
    subgraphOpenLoansKey,
  ]);

  const rateAndDelayQueries = useQuery(
    ['rateAndDelayQuery', isL2],
    async () => {
      if (!collateralManagerContract || !ethLoanContract) {
        throw Error('Expected contracts to be defined');
      }
      const [[borrowRate], ethBorrowIssueFeeRate, ethInteractionDelay] = await Promise.all([
        collateralManagerContract.getBorrowRate(),
        ethLoanContract.issueFeeRate(),
        ethLoanContract.interactionDelay ? ethLoanContract.interactionDelay() : wei(0),
      ]);
      const perYr = SECONDS_IN_A_YR / 1e18;

      return {
        borrowRate: wei(borrowRate.toString()).mul(wei(perYr.toString())),
        issueFeeRate: wei(ethBorrowIssueFeeRate.toString()).mul(1 / 1e18),
        interactionDelay: wei(ethInteractionDelay.toString()),
      };
    },
    { enabled: Boolean(isAppReady && collateralManagerContract && ethLoanContract) }
  );

  // pending withdrawals
  const loadPendingWithdrawals = async (
    ethLoanContract: ethers.Contract | null,
    isMounted: boolean,
    setPendingWithdrawals: (pw: BigNumber) => void,
    address: string
  ) => {
    if (!ethLoanContract) return;
    const pw = await ethLoanContract.pendingWithdrawals(address);
    if (isMounted) {
      setPendingWithdrawals(pw);
    }
  };

  const reloadPendingWithdrawals = async () => {
    if (walletAddress && ethLoanContract) {
      await sleep(1000);
      await loadPendingWithdrawals(ethLoanContract, true, setPendingWithdrawals, walletAddress);
    }
  };

  useEffect(() => {
    if (!(ethLoanContract && walletAddress)) return;
    let isMounted = true;
    (async () => {
      loadPendingWithdrawals(ethLoanContract, isMounted, setPendingWithdrawals, walletAddress);
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [ethLoanContract, walletAddress]);
  return {
    loans,
    isLoadingLoans,
    interestRate: rateAndDelayQueries.data?.borrowRate || wei(0),
    issueFeeRate: rateAndDelayQueries.data?.issueFeeRate || wei(0),
    interactionDelay: rateAndDelayQueries.data?.interactionDelay || wei(0),
    minCRatio: minCratioQuery.data,
    pendingWithdrawals,
    reloadPendingWithdrawals,
    ethLoanContract,
  };
}
export default createContainer(Container);
