import dynamic from 'next/dynamic';

const DashboardPage = dynamic(() => import('../content/DashboardPage'), {
	ssr: true,
});

export default DashboardPage;
