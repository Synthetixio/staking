import { FC, useRef } from 'react';
import styled from 'styled-components';

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
      icon: <Welcome width="215" />,
      title: t('homepage.welcome.title'),
      subtitle: t('homepage.welcome.subtitle'),
      id: 'welcome',
    },
    {
      icon: <What width="184" />,
      title: t('homepage.what.title'),
      subtitle: t('homepage.what.subtitle'),
      id: 'what',
    },
    {
      icon: <Why width="229" />,
      title: t('homepage.why.title'),
      subtitle: t('homepage.why.subtitle'),
      id: 'why',
    },
    {
      icon: <MintBurn width="186" />,
      title: t('homepage.mint-burn.title'),
      subtitle: t('homepage.mint-burn.subtitle'),
      id: 'mintBurn',
    },
    {
      icon: <Debt width="154" />,
      title: t('homepage.risks.title'),
      subtitle: t('homepage.risks.subtitle'),
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
                <Title>{title}</Title>
                <Subtitle>{subtitle}</Subtitle>
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

  .slick-slider {
    position: relative;
    display: block;
    box-sizing: border-box;
    user-select: none;
    touch-action: pan-y;
  }

  .slick-list {
    position: relative;
    display: block;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  .slick-list:focus {
    outline: 0;
  }

  .slick-slider .slick-list,
  .slick-slider .slick-track {
    transform: translate3d(0, 0, 0);
  }

  .slick-track {
    position: relative;
    top: 0;
    left: 0;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .slick-track:after,
  .slick-track:before {
    display: table;
    content: '';
  }

  .slick-track:after {
    clear: both;
  }

  .slick-loading .slick-track {
    visibility: hidden;
  }

  .slick-slide {
    display: none;
    float: left;
    height: 100%;
    min-height: 1px;
  }

  [dir='rtl'] .slick-slide {
    float: right;
  }

  .slick-slide img {
    display: block;
  }

  .slick-slide.dragging img {
    pointer-events: none;
  }

  .slick-initialized .slick-slide {
    display: block;
  }

  .slick-dots {
    position: absolute;
    bottom: -25px;
    display: block;
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    text-align: center;
  }

  .slick-dots li {
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin: 0 5px;
    padding: 0;
    cursor: pointer;
  }

  .slick-dots li button {
    font-size: 0;
    line-height: 0;
    display: block;
    width: 20px;
    height: 20px;
    padding: 5px;
    cursor: pointer;
    color: transparent;
    border: 0;
    outline: 0;
    background: 0 0;
  }

  .slick-dots li button:focus,
  .slick-dots li button:hover {
    outline: 0;
  }

  .slick-dots li button:focus:before,
  .slick-dots li button:hover:before {
    opacity: 1;
  }

  .slick-dots li button:before {
    font-size: 32px;
    line-height: 20px;
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    content: '•';
    text-align: center;
  }

  .slick-dots {
    li {
      margin: 0 2px;
      button:before {
        color: ${(props) => props.theme.colors.gray};
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
