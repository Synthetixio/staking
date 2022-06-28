import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const EscrowPage = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "escrow" */ '../../content/EscrowPage')),
	{ ssr: true }
);

export default EscrowPage;
