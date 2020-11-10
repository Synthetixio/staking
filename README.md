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
- Blocknative Notify - for tx notifications.
- [synthetix-data](https://github.com/Synthetixio/synthetix-data) - for historical data (powered by [TheGraph](https://thegraph.com/)).
- [@synthetixio/js](https://github.com/Synthetixio/js) - for interactions with the Synthetix protocol.

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
- `NEXT_PUBLIC_BN_NOTIFY_API_KEY` - Blocknative Notify API key (get it from [blocknative.com](https://blocknative.com/))
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
