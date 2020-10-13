import Connector from 'containers/Connector';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const Landing = () => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();
	return (
		<>
			<a onClick={connectWallet}>Connect wallet</a>
		</>
	);
};

export default Landing;
