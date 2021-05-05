import styled from 'styled-components';
import media from 'styles/media';

export const ContainerRow = styled.span`
	display: inline-grid;
	grid-gap: 2px;

	${media.lessThan('md')`
        display: flex;
        flex-direction: row;
    `}
`;
