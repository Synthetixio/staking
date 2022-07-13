import 'styles/main.css';
import '@reach/dialog/styles.css';
import 'tippy.js/dist/tippy.css';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('content/App'), {
	ssr: false,
});

export default App;
