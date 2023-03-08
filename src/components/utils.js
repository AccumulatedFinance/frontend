import BigNumber from 'bignumber.js'

export const truncateAddress = (address) => {
    if (!address) return "No Account";
    const match = address.match(
      /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
    );
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};
  
export const toHex = (num) => {
    const val = Number(num);
    return "0x" + val.toString(16);
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function web3BNToFloatString(
  bn,
  divideBy,
  decimals,
  roundingMode = BigNumber.ROUND_DOWN
) {
  const converted = new BigNumber(bn)
  const divided = converted.div(divideBy)
  return divided.toFixed(decimals, roundingMode)
}

export const decimalCount = (num) => {
  const numStr = String(num);
  if (numStr.includes('.')) {
     return numStr.split('.')[1].length;
  };
  return 0;
}

export const toRoundedDown = (num, precision) => {
  const p = Math.pow(10, precision)
  const result = Math.floor((Number(num) + Number.EPSILON) * p) / p
  return Number(result)
}

export const calculateAPR = (rewardRate, rewardDuration, totalStaked) => {
  const secondPerYear = 86400 * 365;
  const rate = rewardRate * rewardDuration / totalStaked;
  const apr = (1+rate) ** (secondPerYear / rewardDuration) - 1;
  return apr.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}