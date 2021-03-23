# Staking

## Tech stack

- Next.js
- React
- React Query
- Recoil
- Unstated-next
- Styled-Components
- Immer

## Ethereum stack

- ethers.js v5 - Ethereum wallet implementation.
- Blocknative Onboard - for ethereum wallet connectivity.
- [synthetix-data](https://github.com/Synthetixio/synthetix-data) - for historical data (powered by [TheGraph](https://thegraph.com/)).
- [@synthetixio/contracts-interface](https://github.com/Synthetixio/js-monorepo) - for interactions with the Synthetix protocol.
- [@synthetixio/providers](https://github.com/Synthetixio/js-monorepo) - for web3 providers on Layer 1 & 2.
- [@synthetixio/optimism-networks](https://github.com/Synthetixio/js-monorepo) - Utility library for Optimism Layer 2 support.
- [@synthetixio/transaction-notifier](https://github.com/Synthetixio/js-monorepo) - for transaction status.

## Development

### Install dependencies

```bash
npm i
```

### Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then, open `.env.local` and add the missing environment variables:

- `NEXT_PUBLIC_PORTIS_APP_ID` - Portis app id (get it from [portis.io](https://www.portis.io/))
- `NEXT_PUBLIC_BN_ONBOARD_API_KEY` - Blocknative Onboard API key (get it from [blocknative.com](https://blocknative.com/))
- `NEXT_PUBLIC_INFURA_PROJECT_ID` - Infura project id (get it from [infura.io](https://infura.io/))

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build

```bash
npm run build
npm start
```

### Test

Before running e2e tests, you have to set environmental variable named `SECRET_WORDS` which can be imported as an account in metamask.

```bash
SECRET_WORDS="word1, word2, ..." npm run test:e2e
```
