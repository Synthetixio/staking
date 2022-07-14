// @ts-nocheck

import { bootstrap } from './no-next/bootstrap';

bootstrap();

if (module.hot) {
	module.hot.accept();
	module.hot.dispose(() => {
		// do nothing
	});
}
