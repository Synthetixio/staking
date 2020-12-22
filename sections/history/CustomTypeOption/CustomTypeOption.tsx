import { components, OptionProps } from 'react-select';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import TypeIcon from '../TypeIcon';

import { TypeFilterOptionType } from '../types';
const { Option } = components;

const CustomTypeOption = (props: OptionProps<TypeFilterOptionType>) => (
	<Option {...props}>
		<Container>
			<TypeIcon size="sm" type={props.data.value} />
			{props.data.label}
		</Container>
	</Option>
);

const Container = styled(FlexDivCentered)`
	svg {
		margin-right: 7px;
	}
`;

export default CustomTypeOption;
