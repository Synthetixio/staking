import { Icon, IconProps } from '@chakra-ui/react';

interface SUSDIconProps extends IconProps {
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const SUSDIcon = ({
  width = 25,
  height = 24,
  color = 'white',
  backgroundColor = '#0E052F',
  ...props
}: SUSDIconProps) => {
  return (
    <Icon
      width={`${width}px`}
      height={`${height}px`}
      fill="none"
      viewBox="0 0 25 24"
      sx={{
        mask: {
          maskType: 'alpha',
        },
      }}
      {...props}
    >
      <mask id="b" maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
        <circle cx="12.5" cy="12" r="12" fill="url(#a)" />
      </mask>
      <g mask="url(#b)">
        <circle cx="12.5" cy="12" r="12" fill="#31D8A4" />
        <circle cx="12.5" cy="12" r="10.4" fill={color} />
      </g>
      <circle cx="12.501" cy="12" r="9.2" fill={backgroundColor} />
      <path
        d="M12.193 16.152a3.75 3.75 0 0 1-1.128-.264 3.138 3.138 0 0 1-.912-.588 2.818 2.818 0 0 1-.612-.828 2.42 2.42 0 0 1-.24-1.02h1.476c.016.392.152.72.408.984.264.256.6.404 1.008.444v-2.376l-.564-.084c-.648-.088-1.164-.332-1.548-.732-.376-.4-.564-.908-.564-1.524 0-.32.072-.62.216-.9.144-.288.34-.54.588-.756.248-.224.532-.404.852-.54.328-.136.668-.22 1.02-.252V6.6h.876v1.14c.36.048.692.144.996.288.304.136.568.312.792.528.224.216.4.464.528.744.136.28.212.58.228.9h-1.476a1.132 1.132 0 0 0-.324-.744 1.469 1.469 0 0 0-.744-.444v2.196l.408.06c.304.048.592.132.864.252s.508.276.708.468c.208.192.368.424.48.696.12.264.18.564.18.9a2.348 2.348 0 0 1-.756 1.752 2.973 2.973 0 0 1-.84.54c-.32.136-.668.224-1.044.264v1.236h-.876v-1.224Zm.876-1.284c.376-.064.668-.2.876-.408a1.13 1.13 0 0 0 .312-.816c0-.304-.1-.528-.3-.672a1.601 1.601 0 0 0-.684-.3l-.204-.036v2.232Zm-.876-5.892a1.694 1.694 0 0 0-.864.372c-.232.192-.348.452-.348.78 0 .28.076.492.228.636.16.136.368.224.624.264l.36.06V8.976Z"
        fill={color}
      />
      <defs>
        <linearGradient
          id="a"
          x1="12.5"
          y1="0"
          x2="12.5"
          y2="35.091"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#08021E" />
          <stop offset="1" stopColor="#1F0777" />
        </linearGradient>
      </defs>
    </Icon>
  );
};
