import { FC } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import styled, { css } from 'styled-components';
import Img from 'react-optimized-image';

import Welcome from 'assets/png/wizard/welcome.png';
import What from 'assets/png/wizard/what.png';
import Why from 'assets/png/wizard/why.png';
import MintBurn from 'assets/png/wizard/mint-burn.png';
import Debt from 'assets/png/wizard/debt.png';

import { GridBoxContainer } from './GridBox';
import { useTranslation } from 'react-i18next';

type WizardGridBoxProps = {
	gridLocations: [string, string, string, string];
};

export const WizardGridBox: FC<WizardGridBoxProps> = ({ gridLocations }) => (
	<GridBoxContainer
		columnStart={gridLocations[0]}
		columnEnd={gridLocations[1]}
		rowStart={gridLocations[2]}
		rowEnd={gridLocations[3]}
	>
		<WizardWrap>
			{/* @ts-ignore */}
			<StepWizard nav={<Nav />} isLazyMount>
				<WizardPage
					icon={<Img src={Welcome} />}
					title="homepage.welcome.title"
					subtitle="homepage.welcome.subtitle"
				/>
				<WizardPage
					icon={<Img src={What} />}
					title="homepage.what.title"
					subtitle="homepage.what.subtitle"
				/>
				<WizardPage
					icon={<Img src={Why} />}
					title="homepage.why.title"
					subtitle="homepage.why.subtitle"
				/>
				<WizardPage
					icon={<Img src={MintBurn} />}
					title="homepage.mint-burn.title"
					subtitle="homepage.mint-burn.subtitle"
				/>
				<WizardPage
					icon={<Img src={Debt} />}
					title="homepage.debt.title"
					subtitle="homepage.debt.subtitle"
				/>
			</StepWizard>
		</WizardWrap>
	</GridBoxContainer>
);

const WizardWrap = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
	div {
		z-index: 0;
	}
`;

const Nav: FC<StepWizardChildProps> = (props) => {
	const dots = [];
	for (let i = 1; i <= props.totalSteps; i += 1) {
		const isActive = props.currentStep === i;
		dots.push(
			<Dot key={`step-${i}`} isActive={isActive} onClick={() => props.goToStep(i)}>
				&bull;
			</Dot>
		);
	}

	return <NavContainer>{dots}</NavContainer>;
};

const NavContainer = styled.div`
	margin-bottom: 15px;
	text-align: center;
	display: flex;
	justify-content: center;
	position: absolute;
	bottom: 0;
	width: 100%;
`;

const Dot = styled.div<{ isActive: boolean }>`
	color: black;
	cursor: pointer;
	font-size: 36px;
	line-height: 1;
	margin: 0 15px;
	opacity: 0.4;
	text-shadow: none;
	transition: opacity 1s ease, text-shadow 1s ease;
	will-change: opacity, text-shadow;
	color: ${(props) => props.theme.colors.gray};
	${(props) =>
		props.isActive &&
		css`
			color: ${props.theme.colors.blue};
			opacity: 1;
			text-shadow: 0 0px 8px;
		`}
`;

type WizardPageProps = {
	title: string;
	subtitle: string;
	icon: React.ReactNode;
};

const WizardPage: React.FC<WizardPageProps> = ({ title, subtitle, icon }) => {
	const { t } = useTranslation();
	return (
		<Page>
			<IconContainer>{icon}</IconContainer>
			<Title>{t(`${title}`)}</Title>
			<Subtitle>{t(`${subtitle}`)}</Subtitle>
		</Page>
	);
};

const Page = styled.div`
	text-align: center;
	padding-top: 50px;
	margin: 0px 24px;
`;

const IconContainer = styled.div`
	height: 200px;
	margin: 16px 0px;
`;
const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
`;

const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

export default WizardGridBox;
