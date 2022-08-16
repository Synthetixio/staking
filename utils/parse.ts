import { wei, WeiSource } from '@synthetixio/wei';

export function parseSafeWei(v: WeiSource, def: WeiSource) {
  let p = wei(def);
  try {
    p = wei(v);
  } catch (_) {}

  return p;
}
