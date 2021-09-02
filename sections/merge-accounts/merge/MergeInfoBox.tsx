import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import media from 'styles/media';

const InfoBox: FC = () => {
	const { t } = useTranslation();

	return (
		<Root>
			<Container>
				<ContainerHeader>
					<Title>{t('merge-accounts.info.title')}</Title>
				</ContainerHeader>
				<StatsGrid>
					<StatsHeader>
						<div>{t('merge-accounts.info.description')}</div>
					</StatsHeader>
				</StatsGrid>
			</Container>
		</Root>
	);
};

export default InfoBox;

//

export const Root = styled.div`
	& > div {
		${media.greaterThan('mdUp')`
			margin: 0 0 16px;
		`}

		${media.lessThan('mdUp')`
			margin: 16px 0;
		`}
	}

	a,
	a:visited {
		color: ${(props) => props.theme.colors.blue};
		text-decoration: none;
	}
`;

export const Container = styled.div`
	background: ${(props) => props.theme.colors.navy};
`;

export const ContainerHeader = styled.div`
	padding: 16px;
`;

export const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
`;
export const Subtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin-top: 12px;
`;

export const StatsGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
	grid-template-columns: 2fr 1fr;
	font-size: 14px;
	padding: 0 0 16px 0;
`;

export const StatsRow = styled.div``;

export const StatsHeader = styled.div`
	color: ${(props) => props.theme.colors.gray};
	border-top: 1px solid ${(props) => props.theme.colors.grayBlue};
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	font-family: ${(props) => props.theme.fonts.interBold};

	&:nth-child(even) {
		text-align: right;
	}

	& > div {
		padding: 8px 16px;
		white-space: nowrap;
		display: flex;
		align-items: center;
	}
`;

export const StatsCol = styled.div`
	&:nth-child(odd) {
		margin-left: 16px;
	}

	&:nth-child(even) {
		margin-right: 16px;

		& div {
			justify-content: flex-end;
		}
	}

	& > div {
		padding: 8px 0;
		height: 100%;
		display: flex;
		align-items: center;
		border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	}
`;
