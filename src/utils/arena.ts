export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatUSDValue = (weiValue: string) => {
  const value = Number(weiValue) / 1e30;
  return `${value.toFixed(2)} USD`;
};

export const formatDuration = (seconds: string) => {
  const sec = parseInt(seconds);
  if (sec >= 3600) {
    return `${Math.floor(sec / 3600)}h`;
  } else if (sec >= 60) {
    return `${Math.floor(sec / 60)}m`;
  }
  return `${sec}s`;
};
