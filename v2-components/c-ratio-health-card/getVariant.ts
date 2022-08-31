export const getVariant = ({
  targetCratioPercentage,
  liquidationCratioPercentage,
  currentCRatioPercentage,
}: {
  liquidationCratioPercentage: number;
  targetCratioPercentage: number;
  currentCRatioPercentage: number;
}) => {
  if (currentCRatioPercentage < liquidationCratioPercentage) return 'error';
  if (currentCRatioPercentage < targetCratioPercentage) return 'warning';
  return 'success';
};
