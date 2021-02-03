# Changelog

## 5 Jan 2021

- Fix watch wallet bug not working if user does not initialise with a signer.
- Add settlement flow in "earn" when user has to settle their rebate/reclaim before staking their inverse synths in the LP staking rewards contracts.
- Fix incorrect values showing up on the mint and burn information panel (negative values were Math.abs() and showed large incorrect values)

## 18 Jan 2021

- Fix staking info bug where the c-ratio was not calculated properly
- Enable decimals to be inputted when custom mint or burn
- Update SNX data package

## 30 Jan 2021

- Fix burn to target, when a user is under the c-ratio and does not have enough sUSD to burn to target, they are still allowed to click into the tile to see the required amount needed (Issue 281)
- Removed the balance button when a user is one the burn to target flow and make it only appear on the custom tag
