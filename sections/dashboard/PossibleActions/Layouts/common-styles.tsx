import styled from 'styled-components';

import { GridDiv } from 'styles/common';
import media from 'styles/media';

export const ActionsContainer = styled(GridDiv)`
	margin-top: 30px;
	justify-items: stretch;
	align-items: stretch;

	${media.lessThan('sm')`
    display: flex;
    flex-direction: column;
  `}
`;
