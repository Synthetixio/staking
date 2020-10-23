import { FC } from 'react';
import StructuredTab from 'components/StructuredTab/StructuredTab';

interface MintBurnBoxProps {}

const MintBurnBox: FC<MintBurnBoxProps> = ({}) => {
	return (
		<>
			<StructuredTab
				boxHeight={400}
				boxWidth={550}
				tabData={[
					{ title: 'Mint', tabChildren: <>Test Mint</> },
					{ title: 'Burn', tabChildren: <>Test Burn</> },
				]}
			/>
		</>
	);
};

export default MintBurnBox;
