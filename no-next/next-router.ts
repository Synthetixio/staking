import { useNavigate, useLocation } from 'react-router-dom';

export function useRouter() {
	const navigate = useNavigate();
	const location = useLocation();

	return {
		query: {},
		push: navigate,
		pathname: location.pathname,
		asPath: location.pathname,
	};
}
