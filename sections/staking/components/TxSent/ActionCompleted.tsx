import React, { FC } from 'react';
import styled from 'styled-components';

import { SectionHeader } from './common';

// type ActionCompletedProps = {};

// const ActionCompleted: FC<ActionCompletedProps> = () => (
const ActionCompleted: FC = () => (
	<Container>
		<SectionHeader>TODO completed</SectionHeader>
	</Container>
);
const Container = styled.div``;

export default ActionCompleted;
