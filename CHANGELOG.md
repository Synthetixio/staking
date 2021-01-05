# Changelog

## 5 Jan 2021

- Fix watch wallet bug not working if user does not initialise with a signer.
- Add settlement flow in "earn" when user has to settle their rebate/reclaim before staking their inverse synths in the LP staking rewards contracts.
- Fix incorrect values showing up on the mint and burn information panel (negative values were Math.abs() and showed large incorrect values)
