import { Icon, IconProps } from '@chakra-ui/react';

interface SLINKIconProps extends IconProps {
  width?: number;
  height?: number;
}

export const SLINKIcon = ({ width = 34, height = 34, ...props }: SLINKIconProps) => {
  return (
    <Icon
      width={width}
      height={height}
      viewBox="0 0 34 34"
      fill="none"
      sx={{
        mask: {
          maskType: 'alpha',
        },
      }}
      {...props}
    >
      <mask id="mask0_1070_25633" maskUnits="userSpaceOnUse" x="0" y="0" width="34" height="34">
        <circle cx="17" cy="17" r="17" fill="url(#paint0_linear_1070_25633)" />
      </mask>
      <g mask="url(#mask0_1070_25633)">
        <circle cx="17" cy="17" r="17" fill="#31D8A4" />
        <circle cx="16.9999" cy="16.9999" r="14.7333" fill="white" />
      </g>
      <circle cx="17.0001" cy="17.0001" r="13.0333" fill="#0E052F" />
      <g clipPath="url(#clip0_1070_25633)">
        <path
          d="M17.0001 30.0335C24.1982 30.0335 30.0335 24.1982 30.0335 17.0001C30.0335 9.80202 24.1982 3.9668 17.0001 3.9668C9.80202 3.9668 3.9668 9.80202 3.9668 17.0001C3.9668 24.1982 9.80202 30.0335 17.0001 30.0335Z"
          fill="#2A5ADA"
        />
        <g clipPath="url(#clip1_1070_25633)">
          <path
            d="M16.9998 8.15039L18.6088 9.0756L22.9935 11.6099L24.6025 12.5351V21.3044L22.9935 22.2296L18.5686 24.7639L16.9595 25.6891L15.3505 24.7639L11.006 22.2296L9.39697 21.3044V12.5351L11.006 11.6099L15.3907 9.0756L16.9998 8.15039V8.15039ZM21.3844 19.454V14.3855L16.9998 11.8512L12.6151 14.3855V19.454L16.9998 21.9883L21.3844 19.454Z"
            fill="white"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_1070_25633"
          x1="17"
          y1="0"
          x2="17"
          y2="49.7121"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#08021E" />
          <stop offset="1" stopColor="#1F0777" />
        </linearGradient>
        <clipPath id="clip0_1070_25633">
          <rect
            width="26.0667"
            height="26.0667"
            fill="white"
            transform="translate(3.9668 3.9668)"
          />
        </clipPath>
        <clipPath id="clip1_1070_25633">
          <rect
            width="15.2056"
            height="17.5387"
            fill="white"
            transform="matrix(-1 0 0 1 24.6025 8.15039)"
          />
        </clipPath>
      </defs>
    </Icon>
  );
};
