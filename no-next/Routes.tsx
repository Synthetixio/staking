import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { safeLazy } from '@synthetixio/safe-import';
import AppLayout from '../sections/shared/Layout/AppLayout';

const DashboardPage = safeLazy(
	() => import(/* webpackChunkName: "dashboard" */ 'content/DashboardPage')
);
const SynthsPage = safeLazy(() => import(/* webpackChunkName: "synths" */ 'content/SynthsPage'));

const StakingPage = safeLazy(() => import(/* webpackChunkName: "staking" */ 'content/StakingPage'));

const LoansPage = safeLazy(() => import(/* webpackChunkName: "loans" */ 'content/LoansPage'));
const NotFound = safeLazy(() => import(/* webpackChunkName: "404" */ '../pages/404'));

function Page(props) {
	return <pre style={{ padding: '50px' }}>{JSON.stringify(props, null, 2)}</pre>;
}

export default function AppRoutes() {
	return (
		<BrowserRouter>
			<AppLayout>
				<Routes>
					<Route path="/loans" element={<Navigate to="/loans/new" replace={true} />} />
					<Route path="/escrow" element={<Navigate to="/loans/rewards" replace={true} />} />

					<Route path="/" element={<DashboardPage />} />
					<Route path="/staking" element={<StakingPage />}>
						<Route path="/staking/:action" element={<StakingPage />} />
					</Route>
					<Route path="/loans" element={<LoansPage />} />
					<Route path="/synths" element={<SynthsPage />} />

					<Route path="/gov" element={<Page />} />
					<Route path="/earn" element={<Page />} />
					<Route path="/debt" element={<Page />} />
					<Route path="/l2" element={<Page />} />
					<Route path="/escrow" element={<Page />} />
					<Route path="/escrow/rewards" element={<Page />} />
					<Route path="/escrow/ico" element={<Page />} />
					<Route path="/history" element={<Page />} />
					<Route path="/delegate" element={<Page />} />
					<Route path="/merge-accounts" element={<Page />} />

					<Route path="*" element={<NotFound />} />
				</Routes>
			</AppLayout>
		</BrowserRouter>
	);
}
