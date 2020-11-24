import styled from 'styled-components';

export const SectionHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	text-align: center;
	margin: 5px 0 20px 0;
`;

export const SectionSubtext = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
`;
