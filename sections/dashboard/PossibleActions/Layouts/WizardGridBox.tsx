import { FC } from 'react';
import StepWizard from 'react-step-wizard';
import styled, { css } from 'styled-components';

import { GridBoxContainer } from './GridBox';

interface WizardGridBoxProps {
	gridLocations: [string, string, string, string];
}

export const WizardGridBox: FC<WizardGridBoxProps> = ({ gridLocations }) => (
	<GridBoxContainer
		columnStart={gridLocations[0]}
		columnEnd={gridLocations[1]}
		rowStart={gridLocations[2]}
		rowEnd={gridLocations[3]}
	>
		<WizardWrap>
			{/* @ts-ignore */}
			<StepWizard nav={<Nav />}>
				<ExamplePage>TODO: Welcome page 1</ExamplePage>
				<ExamplePage>TODO: Welcome page 2</ExamplePage>
				<ExamplePage>TODO: Welcome page 3</ExamplePage>
				<ExamplePage>TODO: Welcome page 4</ExamplePage>
				<ExamplePage>TODO: Welcome page 5</ExamplePage>
			</StepWizard>
		</WizardWrap>
	</GridBoxContainer>
);

const ExamplePage = styled.div`
	font-size: 20px;
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
	text-align: center;
	padding-top: 370px;
`;

const WizardWrap = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
`;

interface NavProps {
	totalSteps: number;
	currentStep: number;
	goToStep: (num: number) => null;
}

const Nav: FC<NavProps> = ({ totalSteps, currentStep, goToStep }) => {
	const dots = [];
	for (let i = 1; i <= totalSteps; i += 1) {
		const isActive = currentStep === i;
		dots.push(
			<Dot key={`step-${i}`} isActive={isActive} onClick={() => goToStep(i)}>
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
			color: ${props.theme.colors.brightBlue};
			opacity: 1;
			text-shadow: 0 0px 8px;
		`}
`;

export default WizardGridBox;
