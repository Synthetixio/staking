import dynamic from 'next/dynamic';

const HistoryPage = dynamic(() => import('../content/HistoryPage'), {
	ssr: true,
});

export default HistoryPage;
