import 'styles/main.css';
import '@reach/dialog/styles.css';
import 'tippy.js/dist/tippy.css';

import dynamic from 'next/dynamic';
import { safeImport } from '@synthetixio/safe-import';

const App = dynamic(
	() => safeImport(() => import(/* webpackChunkName: "app" */ '../content/App')),
	{ ssr: true }
);

export default App;
