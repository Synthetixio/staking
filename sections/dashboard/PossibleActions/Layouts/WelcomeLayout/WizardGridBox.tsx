import { FC, useRef } from 'react';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';

import Welcome from 'assets/svg/app/wizard/welcome.svg';
import What from 'assets/svg/app/wizard/what.svg';
import Why from 'assets/svg/app/wizard/why.svg';
import MintBurn from 'assets/svg/app/wizard/mint-burn.svg';
import Debt from 'assets/svg/app/wizard/debt.svg';

import { GridBoxContainer } from 'components/GridBox/Gridbox';
import { useTranslation } from 'react-i18next';
import { FlexDivCentered } from 'styles/common';
import Slider from 'react-slick';
import media from 'styles/media';

type WizardGridBoxProps = {
	gridArea?: string;
};

export const WizardGridBox: FC<WizardGridBoxProps> = ({ gridArea }) => {
	const { t } = useTranslation();
	const slider = useRef<any>();
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

	const gotoNext = () => {
		slider.current.slickNext();
	};

	return (
		<GridBoxContainer {...{ gridArea }}>
			<SliderContainer>
				<Slider arrows={false} dots={true} fade={true} ref={slider}>
					{STEPS.map(({ id, icon, subtitle, title }) => (
						<div key={id} onClick={() => gotoNext()}>
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
	padding-bottom: 50px;
	padding-top: 50px;

	${media.lessThan('mdUp')`
		padding-bottom: 10px;
		padding-top: 10px;
	`}

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
		${media.lessThan('mdUp')`
			position: unset;
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
	margin: 0px 48px;
`;
const IconContainer = styled(FlexDivCentered)`
	height: 200px;
	justify-content: center;
`;
const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 18px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	padding-top: 16px;
`;
const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	opacity: 0.75;
	line-height: 17px;
`;

export default WizardGridBox;
