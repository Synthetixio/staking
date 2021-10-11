import { renderHook } from '@testing-library/react-hooks';
import useSynthetixQueries, { StakingTransactionType } from '@synthetixio/queries';
import useClaimedStatus from './useClaimedStatus';
import { RecoilRoot } from 'recoil';
import { Transaction } from 'constants/network';

jest.mock('@synthetixio/queries');
const useSynthetixQueriesMock = useSynthetixQueries as jest.MockedFunction<
	typeof useSynthetixQueries
>;
const wrapper = ({ children }: any) => <RecoilRoot>{children}</RecoilRoot>;

describe('useClaimedStatus', () => {
	test('handles claimed', () => {
		const feeStartTimeMs = new Date('2021-10-10T20:00:00.000Z').getTime();
		useSynthetixQueriesMock.mockReturnValue({
			useFeeClaimHistoryQuery: jest.fn().mockReturnValue({
				data: [
					{ type: StakingTransactionType.Issued, timestamp: new Date().getTime() }, // should be ignored, we only care about fees claimed
					{
						type: StakingTransactionType.FeesClaimed,
						timestamp: feeStartTimeMs + 60 * 1000, // has claimed after period start (and before next period)
					},
				],
			}),
			useGetFeePoolDataQuery: jest.fn().mockReturnValue({
				data: {
					startTime: feeStartTimeMs / 1000,
					feePeriodDuration: 60 * 60, // 1hour in seconds,
				},
			}),
		} as any);

		const { result } = renderHook(() => useClaimedStatus(), { wrapper });

		expect(result.current).toBe(true);
	});
	test('handles claimed in previous period', () => {
		const feeStartTimeMs = new Date('2021-10-10T20:00:00.000Z').getTime();
		useSynthetixQueriesMock.mockReturnValue({
			useFeeClaimHistoryQuery: jest.fn().mockReturnValue({
				data: [
					{ type: StakingTransactionType.Issued, timestamp: new Date().getTime() }, // should be ignored, we only care about fees claimed
					{
						type: StakingTransactionType.FeesClaimed,
						timestamp: feeStartTimeMs - 60 * 1000, // has claimed after period start (and before next period)
					},
				],
			}),
			useGetFeePoolDataQuery: jest.fn().mockReturnValue({
				data: {
					startTime: feeStartTimeMs / 1000,
					feePeriodDuration: 60 * 60, // 1hour in seconds,
				},
			}),
		} as any);

		const { result } = renderHook(() => useClaimedStatus(), { wrapper });

		expect(result.current).toBe(false);
	});
	test('handles no claims', () => {
		const feeStartTimeMs = new Date('2021-10-10T20:00:00.000Z').getTime();
		useSynthetixQueriesMock.mockReturnValue({
			useFeeClaimHistoryQuery: jest.fn().mockReturnValue({
				data: [
					{ type: StakingTransactionType.Issued, timestamp: feeStartTimeMs + 60 * 1000 }, // should be ignored, we only care about fees claimed
				],
			}),
			useGetFeePoolDataQuery: jest.fn().mockReturnValue({
				data: {
					startTime: feeStartTimeMs / 1000,
					feePeriodDuration: 60 * 60, // 1hour in seconds,
				},
			}),
		} as any);

		const { result } = renderHook(() => useClaimedStatus(), { wrapper });

		expect(result.current).toBe(false);
	});
	test('refetch when passed transaction state changes to SUCCESS', () => {
		const feeStartTimeMs = new Date('2021-10-10T20:00:00.000Z').getTime();
		const refetchMock = jest.fn();
		const useFeeClaimHistoryQueryMock = jest.fn().mockReturnValue({
			data: [
				{ type: StakingTransactionType.Issued, timestamp: new Date().getTime() }, // should be ignored, we only care about fees claimed
			],
			refetch: refetchMock,
		});
		useSynthetixQueriesMock.mockReturnValue({
			useFeeClaimHistoryQuery: useFeeClaimHistoryQueryMock,
			useGetFeePoolDataQuery: jest.fn().mockReturnValue({
				data: {
					startTime: feeStartTimeMs / 1000,
					feePeriodDuration: 60 * 60, // 1hour in seconds,
				},
			}),
		} as any);

		const { result } = renderHook(() => useClaimedStatus(Transaction.PRESUBMIT), { wrapper });
		expect(result.current).toBe(false);
		expect(refetchMock).not.toBeCalled();

		// Update the mock to include FeesClaimed transaction
		useFeeClaimHistoryQueryMock.mockClear().mockReturnValue({
			data: [
				{
					type: StakingTransactionType.FeesClaimed,
					timestamp: feeStartTimeMs + 60 * 1000, // has claimed after period start (and before next period)
				},
				{ type: StakingTransactionType.Issued, timestamp: new Date().getTime() }, // should be ignored, we only care about fees claimed
			],
			refetch: refetchMock,
		});

		const { result: result1 } = renderHook(() => useClaimedStatus(Transaction.SUCCESS), {
			wrapper,
		});
		expect(refetchMock).toBeCalled();
		expect(result1.current).toBe(true);
	});
});
