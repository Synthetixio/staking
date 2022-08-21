import { FC } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import media from 'styles/media';
import { useTranslation } from 'react-i18next';

const GridBox: FC<{
  step: number;
  name: string;
}> = ({ step, name }) => {
  const { t } = useTranslation();

  return (
    <Link href={`/merge-accounts/${name}`}>
      <GridBoxContainer>
        <GridBoxIcon>{<Icon>{step}</Icon>}</GridBoxIcon>
        <GridBoxTitle>{t(`merge-accounts.landing.steps.${step}.title`)}</GridBoxTitle>
        <GridBoxCopy>{t(`merge-accounts.landing.steps.${step}.description`)}</GridBoxCopy>
      </GridBoxContainer>
    </Link>
  );
};

const GridBoxContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 120px;
  background: ${(props) => props.theme.colors.darkGradient1};
  box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
  border-radius: 2px;
  transition: transform 0.25s ease-in-out;
  height: 384px;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.darkGradient2};
    transform: scale(1.03);
  }

  ${media.greaterThan('mdUp')`
    max-width: 500px;
  `}
`;

const GridBoxTitle = styled.div`
  font-size: 14px;
  font-family: ${(props) => props.theme.fonts.extended};
  color: ${(props) => props.theme.colors.white};
  margin-top: 20px;
  text-align: center;
`;

const GridBoxIcon = styled.div`
  margin: 0 auto;
`;

const GridBoxCopy = styled.p`
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 12px;
  max-width: 75%;
  text-align: center;
  color: ${(props) => props.theme.colors.white};
  opacity: 0.75;
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  font-size: 24px;
  font-family: ${(props) => props.theme.fonts.extended};
  color: ${(props) => props.theme.colors.blue};
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.colors.blue};
  padding: 12px;
  background: #09092f;
  box-sizing: border-box;
  box-shadow: 0px 0px 15px rgba(68, 239, 193, 0.6);
`;

export default GridBox;
