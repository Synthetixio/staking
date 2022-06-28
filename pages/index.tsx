import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const DashboardPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "dashboard" */ 'content/DashboardPage')),
	{ ssr: true }
);

export default DashboardPage;
