import { header } from '../../../translations/en.json';

export function headerInfo(path: string) {
  type headerKey = keyof typeof header;
  let headerTitle, headerSubtitle;

  const paths = path.split('/').filter((item) => item !== '');

  const mainPath = paths[0];
  const subPath = !paths[1]?.includes('[') && paths[1]; // TODO: Find a better way to test this case

  switch (true) {
    case !mainPath && !subPath:
      headerTitle = 'home';
      break;

    case mainPath === 'gov':
      headerTitle = 'gov';
      break;

    case mainPath === 'l2' && !subPath:
      headerTitle = 'l2';
      break;

    case mainPath === 'pools':
      headerTitle = 'pools';
      break;

    case mainPath === 'loans' && subPath === 'list':
      headerTitle = 'loans';
      headerSubtitle = 'list';
      break;

    case mainPath === 'escrow' && !subPath:
      headerTitle = 'wallet';
      headerSubtitle = 'escrow';
      break;

    case mainPath === 'synths' && !subPath:
      headerTitle = 'wallet';
      headerSubtitle = 'synths';
      break;

    case mainPath === 'history' && !subPath:
      headerTitle = 'wallet';
      headerSubtitle = 'history';
      break;

    case mainPath === 'delegate' && !subPath:
      headerTitle = 'wallet';
      headerSubtitle = 'delegate';
      break;

    case mainPath === 'staking' && !subPath:
      headerTitle = 'staking';
      headerSubtitle = 'mint';
      break;

    case mainPath === 'earn' && !subPath:
      headerTitle = 'staking';
      headerSubtitle = 'earn';
      break;

    case mainPath === 'earn' && subPath === 'liquidation':
      headerTitle = 'staking';
      headerSubtitle = 'earn';
      break;

    case mainPath === 'earn' && subPath === 'claim':
      headerTitle = 'staking';
      headerSubtitle = 'earn';
      break;

    case mainPath === 'debt' && !subPath:
      headerTitle = 'staking';
      headerSubtitle = 'debt';
      break;
    case mainPath === 'bridge' && !subPath:
      headerTitle = 'bridge';
      break;
    case mainPath === 'migrate-escrow' && !subPath:
      headerTitle = 'migrate-escrow';
      break;

    // This handles other cases
    default:
      headerTitle = mainPath as headerKey;
      headerSubtitle = subPath as headerKey;
      break;
  }

  return { headerTitle, headerSubtitle };
}
