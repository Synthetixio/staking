import { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import smallWaveSVG from 'assets/svg/app/small-wave.svg';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { formatCurrency, formatFiatCurrency, toBigNumber } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';
import { ESTIMATE_VALUE } from 'constants/placeholder';

import { FlexDivColCentered } from 'styles/common';

import { StyledButton } from '../../common';

type RewardsBoxProps = {
	tokenRewards: number;
	SNXRate: number;
};

const RewardsBox: FC<RewardsBoxProps> = ({ tokenRewards, SNXRate }) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();

	return (
		<RewardsContainer>
			<RewardsTitle>{t('earn.actions.rewards.title')}</RewardsTitle>
			<Svg src={snxSVG} />
			<RewardsAmountSNX>
				{formatCurrency(CryptoCurrency.SNX, tokenRewards, {
					currencyKey: '',
					decimals: 2,
				})}
			</RewardsAmountSNX>
			<RewardsAmountUSD>
				{ESTIMATE_VALUE}{' '}
				{formatFiatCurrency(getPriceAtCurrentRate(toBigNumber(tokenRewards * SNXRate)), {
					sign: selectedPriceCurrency.sign,
				})}
			</RewardsAmountUSD>
			<StyledButton
				variant="primary"
				onClick={() => console.log('claim')}
				disabled={tokenRewards === 0}
			>
				{t('earn.actions.claim.claim-snx-button')}
			</StyledButton>
		</RewardsContainer>
	);
};

const RewardsContainer = styled(FlexDivColCentered)`
	height: 280px;
	width: 180px;
	margin: 15px;
	padding: 15px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${smallWaveSVG.src});
	background-size: cover;
`;

const RewardsTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 10px;
`;

const RewardsAmountSNX = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 24px;
	color: ${(props) => props.theme.colors.white};
	margin-top: 10px;
`;

const RewardsAmountUSD = styled.div`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.gray};
	margin-top: 5px;
	margin-bottom: 20px;
`;

export default RewardsBox;
