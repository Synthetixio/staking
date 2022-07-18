import { Link } from 'react-router-dom';

export default function NoNextLink({ href, ...props }) {
	return <Link to={href} {...props} />;
}
