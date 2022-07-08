import type { FC } from 'react';
import LoaderIcon from 'assets/svg/app/loader.svg';
import { AbsoluteCenteredDiv } from 'styles/common';

type LoaderProps = {
	inline?: boolean;
};

export const Loader: FC<LoaderProps> = ({ inline }) => {
	const loader = <img alt="Loader" src={LoaderIcon} />;

	return inline ? loader : <AbsoluteCenteredDiv>{loader}</AbsoluteCenteredDiv>;
};

Loader.defaultProps = {
	inline: false,
};

export default Loader;
