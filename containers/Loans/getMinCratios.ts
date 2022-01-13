import { wei } from '@synthetixio/wei';
import { BigNumber, ethers } from 'ethers';

const getMinCRatios = async ({
	ethLoanContract,
	erc20LoanContract,
}: {
	ethLoanContract: ethers.Contract;
	erc20LoanContract: ethers.Contract | null;
}) => {
	const [ethMinCratio, erc20MinCratio]: [BigNumber, BigNumber] = await Promise.all([
		ethLoanContract.minCratio(),
		erc20LoanContract ? erc20LoanContract.minCratio() : Promise.resolve(BigNumber.from(0)),
	]);
	return {
		ethMinCratio: wei(ethMinCratio),
		erc20MinCratio: wei(erc20MinCratio),
	};
};
export default getMinCRatios;
