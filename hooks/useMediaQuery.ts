import { useMediaQuery as baseUseMediaQuery } from 'react-responsive';
import { breakpoints, Breakpoint } from 'styles/media';

const useMediaQuery = (screen: Breakpoint) => {
	const query = `(max-width: ${breakpoints[screen]}px)`;
	return baseUseMediaQuery({ query });
};

export default useMediaQuery;
