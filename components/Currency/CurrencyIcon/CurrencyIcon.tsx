import React, { FC } from 'react';
import Img from 'react-optimized-image';

// Crypto
// import BTCIcon from 'assets/svg/currencies/crypto/BTC.svg';
import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';
// import XRPIcon from 'assets/svg/currencies/crypto/XRP.svg';
// import BCHIcon from 'assets/svg/currencies/crypto/BCH.svg';
// import LTCIcon from 'assets/svg/currencies/crypto/LTC.svg';
// import EOSIcon from 'assets/svg/currencies/crypto/EOS.svg';
// import BNBIcon from 'assets/svg/currencies/crypto/BNB.svg';
// import XTZIcon from 'assets/svg/currencies/crypto/XTZ.svg';
// import XMRIcon from 'assets/svg/currencies/crypto/XMR.svg';
// import ADAIcon from 'assets/svg/currencies/crypto/ADA.svg';
// import LINKIcon from 'assets/svg/currencies/crypto/LINK.svg';
// import TRXIcon from 'assets/svg/currencies/crypto/TRX.svg';
// import DASHIcon from 'assets/svg/currencies/crypto/DASH.svg';
// import ETCIcon from 'assets/svg/currencies/crypto/ETC.svg';
import SNXIcon from '@synthetixio/assets/snx/SNX.svg';
// import COMPIcon from 'assets/svg/currencies/crypto/COMP.svg';
// import RENIcon from 'assets/svg/currencies/crypto/REN.svg';
// import LENDIcon from 'assets/svg/currencies/crypto/LEND.svg';
// import KNCIcon from 'assets/svg/currencies/crypto/KNC.svg';
// Commodity
// import GOLDIcon from 'assets/svg/currencies/commodity/GOLD.svg';
// import SILVERIcon from 'assets/svg/currencies/commodity/SILVER.svg';
// Equities
// import FTSEIcon from 'assets/svg/currencies/equities/FTSE.svg';
// import NIKKEIIcon from 'assets/svg/currencies/equities/NIKKEI.svg';
// Fiat
// import AUDIcon from 'assets/svg/currencies/fiat/AUD.svg';
// import CADIcon  from 'assets/svg/currencies/fiat/CAD.svg';
// import CHFIcon from 'assets/svg/currencies/fiat/CHF.svg';
// import EURIcon from 'assets/svg/currencies/fiat/EUR.svg';
// import GBPIcon from 'assets/svg/currencies/fiat/GBP.svg';
// import JPYIcon from 'assets/svg/currencies/fiat/JPY.svg';
// import KRWIcon  from 'assets/svg/currencies/fiat/KRW.svg';
// import USDIcon from 'assets/svg/currencies/fiat/USD.svg';
// Indices
// import CEXIcon from 'assets/svg/currencies/indices/CEX.svg';
// import DEFIIcon from 'assets/svg/currencies/indices/DEFI.svg';

// Crypto Synths
import sBTCIcon from '@synthetixio/assets/synths/sBTC.svg';
import sETHIcon from '@synthetixio/assets/synths/sETH.svg';
import sXRPIcon from '@synthetixio/assets/synths/sXRP.svg';
import sBCHIcon from '@synthetixio/assets/synths/sBCH.svg';
import sLTCIcon from '@synthetixio/assets/synths/sLTC.svg';
import sEOSIcon from '@synthetixio/assets/synths/sEOS.svg';
import sBNBIcon from '@synthetixio/assets/synths/sBNB.svg';
import sXTZIcon from '@synthetixio/assets/synths/sXTZ.svg';
import sXMRIcon from '@synthetixio/assets/synths/sXMR.svg';
import sADAIcon from '@synthetixio/assets/synths/sADA.svg';
import sLINKIcon from '@synthetixio/assets/synths/sLINK.svg';
import sTRXIcon from '@synthetixio/assets/synths/sTRX.svg';
import sDASHIcon from '@synthetixio/assets/synths/sDASH.svg';
import sETCIcon from '@synthetixio/assets/synths/sETC.svg';
import iBTCIcon from '@synthetixio/assets/synths/iBTC.svg';
import iETHIcon from '@synthetixio/assets/synths/iETH.svg';
import iXRPIcon from '@synthetixio/assets/synths/iXRP.svg';
import iBCHIcon from '@synthetixio/assets/synths/iBCH.svg';
import iLTCIcon from '@synthetixio/assets/synths/iLTC.svg';
import iEOSIcon from '@synthetixio/assets/synths/iEOS.svg';
import iBNBIcon from '@synthetixio/assets/synths/iBNB.svg';
import iXTZIcon from '@synthetixio/assets/synths/iXTZ.svg';
import iXMRIcon from '@synthetixio/assets/synths/iXMR.svg';
import iADAIcon from '@synthetixio/assets/synths/iADA.svg';
import iLINKIcon from '@synthetixio/assets/synths/iLINK.svg';
import iTRXIcon from '@synthetixio/assets/synths/iTRX.svg';
import iDASHIcon from '@synthetixio/assets/synths/iDASH.svg';
import iETCIcon from '@synthetixio/assets/synths/iETC.svg';
// Commoditiy Synths
import sXAUIcon from '@synthetixio/assets/synths/sXAU.svg';
import sXAGIcon from '@synthetixio/assets/synths/sXAG.svg';
// import sOILIcon from '@synthetixio/assets/synths/sOIL.svg';
// Crypto Index Synths
import sDEFIIcon from '@synthetixio/assets/synths/sDEFI.svg';
import sCEXIcon from '@synthetixio/assets/synths/sCEX.svg';
import iDEFIIcon from '@synthetixio/assets/synths/iDEFI.svg';
import iCEXIcon from '@synthetixio/assets/synths/iCEX.svg';
// Equity Synths
import sFTSEIcon from '@synthetixio/assets/synths/sFTSE.svg';
import sNIKKEIIcon from '@synthetixio/assets/synths/sNIKKEI.svg';
// Forex Synths
import sEURIcon from '@synthetixio/assets/synths/sEUR.svg';
import sJPYIcon from '@synthetixio/assets/synths/sJPY.svg';
import sUSDIcon from '@synthetixio/assets/synths/sUSD.svg';
import sAUDIcon from '@synthetixio/assets/synths/sAUD.svg';
import sGBPIcon from '@synthetixio/assets/synths/sGBP.svg';
import sCHFIcon from '@synthetixio/assets/synths/sCHF.svg';

import { CryptoCurrency, CurrencyKey, Synths } from 'constants/currency';

type CurrencyIconProps = {
	currencyKey: CurrencyKey;
	type?: 'synth' | 'asset';
	className?: string;
	width?: string;
	height?: string;
};

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, type = 'synth', ...rest }) => {
	const props = {
		width: '24px',
		height: '24px',
		alt: currencyKey,
		...rest,
	};

	// TODO: next-optimized-images does not support dynamic imports yet... so it needs to be manually defined.

	// most of the "asset" types were disabled since they were not widely used.
	switch (currencyKey) {
		case CryptoCurrency.ETH: {
			return <Img src={ETHIcon} {...props} />;
		}
		case CryptoCurrency.SNX: {
			return <Img src={SNXIcon} {...props} />;
		}

		case Synths.sBTC: {
			return <Img src={sBTCIcon} {...props} />;
		}
		case Synths.sETH: {
			return type === 'synth' ? (
				<Img src={sETHIcon} {...props} />
			) : (
				<Img src={ETHIcon} {...props} />
			);
		}
		case Synths.sXRP: {
			return <Img src={sXRPIcon} {...props} />;
		}
		case Synths.sBCH: {
			return <Img src={sBCHIcon} {...props} />;
		}
		case Synths.sLTC: {
			return <Img src={sLTCIcon} {...props} />;
		}
		case Synths.sEOS: {
			return <Img src={sEOSIcon} {...props} />;
		}
		case Synths.sBNB: {
			return <Img src={sBNBIcon} {...props} />;
		}
		case Synths.sXTZ: {
			return <Img src={sXTZIcon} {...props} />;
		}
		case Synths.sXMR: {
			return <Img src={sXMRIcon} {...props} />;
		}
		case Synths.sADA: {
			return <Img src={sADAIcon} {...props} />;
		}
		case Synths.sLINK: {
			return <Img src={sLINKIcon} {...props} />;
		}
		case Synths.sTRX: {
			return <Img src={sTRXIcon} {...props} />;
		}
		case Synths.sDASH: {
			return <Img src={sDASHIcon} {...props} />;
		}
		case Synths.sETC: {
			return <Img src={sETCIcon} {...props} />;
		}
		case Synths.iBTC: {
			return <Img src={iBTCIcon} {...props} />;
		}
		case Synths.iETH: {
			return <Img src={iETHIcon} {...props} />;
		}
		case Synths.iXRP: {
			return <Img src={iXRPIcon} {...props} />;
		}
		case Synths.iBCH: {
			return <Img src={iBCHIcon} {...props} />;
		}
		case Synths.iLTC: {
			return <Img src={iLTCIcon} {...props} />;
		}
		case Synths.iEOS: {
			return <Img src={iEOSIcon} {...props} />;
		}
		case Synths.iBNB: {
			return <Img src={iBNBIcon} {...props} />;
		}
		case Synths.iXTZ: {
			return <Img src={iXTZIcon} {...props} />;
		}
		case Synths.iXMR: {
			return <Img src={iXMRIcon} {...props} />;
		}
		case Synths.iADA: {
			return <Img src={iADAIcon} {...props} />;
		}
		case Synths.iLINK: {
			return <Img src={iLINKIcon} {...props} />;
		}
		case Synths.iTRX: {
			return <Img src={iTRXIcon} {...props} />;
		}
		case Synths.iDASH: {
			return <Img src={iDASHIcon} {...props} />;
		}
		case Synths.iETC: {
			return <Img src={iETCIcon} {...props} />;
		}
		case Synths.sEUR: {
			return <Img src={sEURIcon} {...props} />;
		}
		case Synths.sJPY: {
			return <Img src={sJPYIcon} {...props} />;
		}
		case Synths.sUSD: {
			return <Img src={sUSDIcon} {...props} />;
		}
		case Synths.sAUD: {
			return <Img src={sAUDIcon} {...props} />;
		}
		case Synths.sGBP: {
			return <Img src={sGBPIcon} {...props} />;
		}
		case Synths.sCHF: {
			return <Img src={sCHFIcon} {...props} />;
		}
		case Synths.sXAU: {
			return <Img src={sXAUIcon} {...props} />;
		}
		case Synths.sXAG: {
			return <Img src={sXAGIcon} {...props} />;
		}
		case Synths.sCEX: {
			return <Img src={sCEXIcon} {...props} />;
		}
		case Synths.sDEFI: {
			return <Img src={sDEFIIcon} {...props} />;
		}
		case Synths.iCEX: {
			return <Img src={iCEXIcon} {...props} />;
		}
		case Synths.iDEFI: {
			return <Img src={iDEFIIcon} {...props} />;
		}
		case Synths.sFTSE: {
			return <Img src={sFTSEIcon} {...props} />;
		}
		case Synths.sNIKKEI: {
			return <Img src={sNIKKEIIcon} {...props} />;
		}
		default:
			return null;
	}
};

export default CurrencyIcon;
