import { FC } from 'react';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';

import Welcome from 'assets/svg/app/wizard/welcome.svg';
import What from 'assets/svg/app/wizard/what.svg';
import Why from 'assets/svg/app/wizard/why.svg';
import MintBurn from 'assets/svg/app/wizard/mint-burn.svg';
import Debt from 'assets/svg/app/wizard/debt.svg';

import { GridBoxContainer } from './GridBox';
import { useTranslation } from 'react-i18next';
import { FlexDivCentered } from 'styles/common';
import Slider from 'react-slick';
import media from 'styled-media-query';

type WizardGridBoxProps = {
	gridLocations: [string, string, string, string];
};

export const WizardGridBox: FC<WizardGridBoxProps> = ({ gridLocations }) => {
	const { t } = useTranslation();
	const STEPS = [
		{
			icon: <Svg src={Welcome} />,
			title: 'homepage.welcome.title',
			subtitle: 'homepage.welcome.subtitle',
			id: 'welcome',
		},
		{
			icon: <Img src={What} />,
			title: 'homepage.what.title',
			subtitle: 'homepage.what.subtitle',
			id: 'what',
		},
		{
			icon: <Img src={Why} />,
			title: 'homepage.why.title',
			subtitle: 'homepage.why.subtitle',
			id: 'why',
		},
		{
			icon: <Img src={MintBurn} />,
			title: 'homepage.mint-burn.title',
			subtitle: 'homepage.mint-burn.subtitle',
			id: 'mintBurn',
		},
		{
			icon: <Svg src={Debt} />,
			title: 'homepage.risks.title',
			subtitle: 'homepage.risks.subtitle',
			id: 'risks',
		},
	];
	return (
		<GridBoxContainer
			columnStart={gridLocations[0]}
			columnEnd={gridLocations[1]}
			rowStart={gridLocations[2]}
			rowEnd={gridLocations[3]}
		>
			<SliderContainer>
				<Slider arrows={false} dots={true}>
					{STEPS.map(({ id, icon, subtitle, title }) => (
						<div key={id}>
							<StepBox>
								<IconContainer>{icon}</IconContainer>
								<Title>{t(`${title}`)}</Title>
								<Subtitle>{t(`${subtitle}`)}</Subtitle>
							</StepBox>
						</div>
					))}
				</Slider>
			</SliderContainer>
		</GridBoxContainer>
	);
};

const SliderContainer = styled.div`
	.slick-dots {
		li {
			margin: 0 2px;
			button:before {
				color: ${(props) => props.theme.colors.gray};
				font-size: 9px;
				opacity: 0.5;
			}
			&.slick-active {
				button:before {
					color: ${(props) => props.theme.colors.blue};
					opacity: 1;
				}
			}
		}
		bottom: unset;
		text-align: center;
		${media.lessThan('medium')`
			position: unset;
			margin-top: 40px;
			text-align: center;
			top: unset;
		`}
	}
	* {
		outline: none;
	}
`;
const StepBox = styled.div`
	text-align: center;
	padding-top: 50px;
	margin: 0px 48px;
`;
const IconContainer = styled(FlexDivCentered)`
	height: 200px;
	justify-content: center;
`;
const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	padding-top: 16px;
`;
const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	line-height: 17px;
`;

export default WizardGridBox;
