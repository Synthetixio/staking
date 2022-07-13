import dynamic from 'next/dynamic';

const HistoryPage = dynamic(() => import('content/HistoryPage'), { ssr: false });

export default HistoryPage;
