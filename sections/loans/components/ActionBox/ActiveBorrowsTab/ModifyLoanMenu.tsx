import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Tooltip } from 'styles/common';
import { Loan } from 'containers/Loans/types';

const MODAL_WIDTH = 105;

type BorrowModifyModalProps = {
  actions: Array<string>;
  loan: Loan;
};

const BorrowModifyModal: FC<BorrowModifyModalProps> = ({ actions, loan }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const openMenu = () => {
    setShowMenu(true);
  };
  const closeMenu = () => {
    setShowMenu(false);
  };
  const onStartModify = (action: string) => {
    closeMenu();
    router.push(`/loans/${loan.collateralAsset === 'sETH' ? 'eth' : 'erc20'}/${loan.id}/${action}`);
  };

  return (
    <Container
      visible={showMenu}
      arrow={true}
      placement="bottom"
      onClickOutside={closeMenu}
      content={
        <ul>
          {actions.map((action) => (
            <li key={action} onClick={() => onStartModify(action)}>
              {action}
            </li>
          ))}
        </ul>
      }
    >
      <Button onClick={openMenu}>
        {t('loans.tabs.list.actions-menu-label')}{' '}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.705 4.14746L6 6.43746L8.295 4.14746L9 4.85246L6 7.85246L3 4.85246L3.705 4.14746Z"
            fill="#42DDFF"
          />
        </svg>
      </Button>
    </Container>
  );
};

const Button = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${(props) => props.theme.colors.blue};
  cursor: pointer;
  text-transform: uppercase;
`;

const Container = styled(Tooltip)`
  pointer-events: initial;

  .tippy-content {
    width: ${MODAL_WIDTH}px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-top: 2px;
    background-color: ${(props) => props.theme.colors.mediumBlue};
    border-radius: 4px;
    font-size: 12px;
    padding: 0;

    li {
      padding: 10px 20px;
      cursor: pointer;
      text-transform: uppercase;

      &:hover {
        background-color: ${(props) => props.theme.colors.mediumBlueHover};
      }
    }
  }
`;

export default BorrowModifyModal;
