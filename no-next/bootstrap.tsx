import * as React from 'react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { safeLazy } from '@synthetixio/safe-import';
import GlobalLoader from 'components/GlobalLoader';

import '@reach/dialog/styles.css';
import 'tippy.js/dist/tippy.css';
import './app.css';

const App = safeLazy(() => import(/* webpackChunkName: "app" */ './App'));

export async function bootstrap() {
	ReactDOM.render(
		<React.StrictMode>
			<Suspense fallback={<GlobalLoader />}>
				<App />
			</Suspense>
		</React.StrictMode>,
		document.querySelector('#app')
	);
}
