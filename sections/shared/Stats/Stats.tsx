import React from 'react';
import styled from 'styled-components';
import { FlexDivCol } from 'styles/common';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import SingleStatBox from './SingleStatBox';

const Stats: React.FC = () => {
	const router = useRouter();
	const returnStats = () => {
		switch (router.pathname) {
			case ROUTES.History.Home:
				return <SingleStatBox transactionCount={123} />;
			default:
				return null;
		}
	};

	return <Content>{returnStats()}</Content>;
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

export default Stats;
