import styled from 'styled-components';

export const OrdersGroup = styled.div`
	padding-bottom: 16px;
`;
export const OrdersGroupTitle = styled.div`
	padding: 8px 16px;
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	border-bottom: 1px solid ${(props) => props.theme.colors.mediumBlue};
`;
export const OrdersGroupList = styled.div``;
export const OrdersGroupListItem = styled.div`
	padding: 12px 16px;
	border-bottom: 1px solid ${(props) => props.theme.colors.mediumBlue};
`;
export const NoResults = styled.div`
	color: ${(props) => props.theme.colors.silver};
`;
