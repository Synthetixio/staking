import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { useRecoilValue } from 'recoil';

import media from 'styles/media';
import { isWalletConnectedState } from 'store/wallet';
import { CryptoBalance } from 'queries/walletBalances/types';
import { DesktopOrTabletView, MobileOnlyView } from 'components/Media';
import { MOBILE_BODY_PADDING } from 'constants/ui';

import DesktopAssetsTable from './DesktopAssetsTable';
import MobileAssetsTable from './MobileAssetsTable';

type AssetsTableProps = {
	title: ReactNode;
	assets: CryptoBalance[];
	totalValue: BigNumber;
	isLoading: boolean;
	isLoaded: boolean;
	showConvert: boolean;
	showHoldings: boolean;
};

const AssetsTable: FC<AssetsTableProps> = ({
	assets,
	totalValue,
	isLoading,
	isLoaded,
	title,
	showHoldings,
	showConvert,
}) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return (
		<Container>
			{isWalletConnected && <Header>{title}</Header>}

			<DesktopOrTabletView>
				<DesktopAssetsTable
					{...{
						assets,
						totalValue,
						isLoading,
						isLoaded,
						showHoldings,
						showConvert,
					}}
				/>
			</DesktopOrTabletView>

			<MobileOnlyView>
				<MobileAssetsTable
					{...{
						assets,
						totalValue,
						isLoading,
						isLoaded,
						showHoldings,
						showConvert,
					}}
				/>
			</MobileOnlyView>
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 20px;
`;

const Header = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 16px;
	padding-bottom: 20px;

	${media.lessThan('mdUp')`
		padding-left: ${MOBILE_BODY_PADDING}px;
		padding-right: ${MOBILE_BODY_PADDING}px;
	`}
`;

export default AssetsTable;
