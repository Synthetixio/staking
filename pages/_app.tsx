import 'styles/main.css';
import '@reach/dialog/styles.css';
import 'tippy.js/dist/tippy.css';

import dynamic from 'next/dynamic';
import GlobalLoader from 'components/GlobalLoader';

const App = dynamic(() => import('content/App'), {
  ssr: false,
  loading: GlobalLoader,
});

export default App;
