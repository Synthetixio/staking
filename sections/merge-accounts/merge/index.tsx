import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';

import { Cols, Col } from 'sections/merge-accounts/common';
import ActionBox from './MergeActionBox';
import InfoBox from './MergeInfoBox';

const Merge: FC = () => {
	const isAppReady = useRecoilValue(appReadyState);

	return !isAppReady ? null : (
		<Cols>
			<Col>
				<ActionBox />
			</Col>
			<Col>
				<InfoBox />
			</Col>
		</Cols>
	);
};

export default Merge;
