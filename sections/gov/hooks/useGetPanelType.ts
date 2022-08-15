import { useRouter } from 'next/router';
import { PanelType } from 'store/gov';

const useGetPanelType = () => {
  const router = useRouter();

  if (Array.isArray(router.query.panel) && router.query.panel[1]) {
    if (router.query.panel[1] === 'create') {
      return PanelType.CREATE;
    } else {
      return PanelType.PROPOSAL;
    }
  }
  return PanelType.LIST;
};
export default useGetPanelType;
