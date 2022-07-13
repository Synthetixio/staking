import dynamic from 'next/dynamic';

const DashboardPage = dynamic(() => import('content/DashboardPage'), { ssr: false });

export default DashboardPage;
