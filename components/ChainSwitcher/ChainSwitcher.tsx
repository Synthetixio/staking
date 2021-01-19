import { FC } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { FlexDiv } from 'styles/common';
import { CHAINS, CHAINS_MAP } from 'constants/network';
import { currentLayerChainState } from 'store/ui';

const ChainSwitcher: FC = () => {
	const [currentLayerChain, setCurrentLayerChain] = useRecoilState(currentLayerChainState);
	return (
		<Container>
			{CHAINS.map((chain) => (
				<Button
					isL2={chain === CHAINS_MAP.L2}
					isActive={currentLayerChain === chain}
					onClick={() => setCurrentLayerChain(chain)}
				>
					{chain}
				</Button>
			))}
		</Container>
	);
};

const Container = styled(FlexDiv)`
	margin-left: 16px;
	background: ${(props) => props.theme.colors.navy};
	border: 1px solid ${(props) => props.theme.colors.mediumBlue};
	height: 32px;
	align-items: center;
	padding: 0 6px;
`;

const Button = styled.button<{ isActive: boolean; isL2: boolean }>`
	cursor: pointer;
	width: 32px;
	height: 20px;
	background: ${(props) =>
		props.isActive
			? props.isL2
				? `linear-gradient(180deg, #ED1EFF 0%, #00D1FF 100%)`
				: props.theme.colors.mediumBlue
			: props.theme.colors.navy};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	border: none;
	color: ${(props) =>
		props.isActive
			? props.isL2
				? props.theme.colors.black
				: props.theme.colors.white
			: props.theme.colors.gray};
	font-size: 12px;
	&:active,
	&:focus {
		outline: none;
		border: none;
	}
`;

export default ChainSwitcher;
