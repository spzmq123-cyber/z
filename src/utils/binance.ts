import CryptoJS from 'crypto-js';
import axios from 'axios';
import type { BinanceOrder } from '../types';

const BASE_URL = 'https://api.binance.com';
const TESTNET_URL = 'https://testnet.binance.vision';

export function getBaseUrl(testnet: boolean): string {
  return testnet ? TESTNET_URL : BASE_URL;
}

export function getWsUrl(testnet: boolean, symbol: string): string {
  const base = testnet ? 'wss://testnet.binance.vision' : 'wss://stream.binance.com:9443';
  return `${base}/ws/${symbol.toLowerCase()}@trade`;
}

function signQuery(queryString: string, apiSecret: string): string {
  const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
  return signature;
}

export async function getServerTime(testnet: boolean): Promise<number> {
  const url = `${getBaseUrl(testnet)}/api/v3/time`;
  const response = await axios.get(url);
  return response.data.serverTime;
}

export async function getSymbolInfo(testnet: boolean, symbol: string): Promise<any> {
  const url = `${getBaseUrl(testnet)}/api/v3/exchangeInfo`;
  const response = await axios.get(url);
  const sym = response.data.symbols.find((s: any) => s.symbol === symbol);
  return sym;
}

export async function getOpenOrders(apiKey: string, apiSecret: string, symbol: string, testnet: boolean): Promise<BinanceOrder[]> {
  const timestamp = Date.now();
  const queryString = `symbol=${symbol}&timestamp=${timestamp}`;
  const signature = signQuery(queryString, apiSecret);
  
  const url = `${getBaseUrl(testnet)}/api/v3/openOrders?${queryString}&signature=${signature}`;
  const response = await axios.get(url, {
    headers: { 'X-MBX-APIKEY': apiKey }
  });
  return response.data;
}

export async function cancelAllOrders(apiKey: string, apiSecret: string, symbol: string, testnet: boolean): Promise<void> {
  const openOrders = await getOpenOrders(apiKey, apiSecret, symbol, testnet);
  
  for (const order of openOrders) {
    const timestamp = Date.now();
    const queryString = `symbol=${symbol}&orderId=${order.orderId}&timestamp=${timestamp}`;
    const signature = signQuery(queryString, apiSecret);
    
    const url = `${getBaseUrl(testnet)}/api/v3/order?${queryString}&signature=${signature}`;
    await axios.delete(url, {
      headers: { 'X-MBX-APIKEY': apiKey }
    });
  }
}

export async function placeLimitOrder(
  apiKey: string,
  apiSecret: string,
  symbol: string,
  side: 'BUY' | 'SELL',
  price: number,
  quantity: number,
  testnet: boolean
): Promise<BinanceOrder> {
  const timestamp = Date.now();
  const queryString = `symbol=${symbol}&side=${side}&type=LIMIT&timeInForce=GTC&quantity=${quantity}&price=${price}&timestamp=${timestamp}`;
  const signature = signQuery(queryString, apiSecret);
  
  const url = `${getBaseUrl(testnet)}/api/v3/order?${queryString}&signature=${signature}`;
  const response = await axios.post(url, null, {
    headers: { 'X-MBX-APIKEY': apiKey }
  });
  return response.data;
}

export async function placeMarketOrder(
  apiKey: string,
  apiSecret: string,
  symbol: string,
  side: 'BUY' | 'SELL',
  quantity: number,
  testnet: boolean
): Promise<BinanceOrder> {
  const timestamp = Date.now();
  const queryString = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
  const signature = signQuery(queryString, apiSecret);
  
  const url = `${getBaseUrl(testnet)}/api/v3/order?${queryString}&signature=${signature}`;
  const response = await axios.post(url, null, {
    headers: { 'X-MBX-APIKEY': apiKey }
  });
  return response.data;
}

export async function closeAllPositions(
  apiKey: string,
  apiSecret: string,
  symbol: string,
  testnet: boolean,
  onLog: (msg: string, type: 'info' | 'success' | 'warning' | 'error' | 'trade') => void
): Promise<void> {
  // First cancel all open orders
  onLog('Cancelling all open orders...', 'warning');
  await cancelAllOrders(apiKey, apiSecret, symbol, testnet);
  
  // Get current positions from account info
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = signQuery(queryString, apiSecret);
  
  const url = `${getBaseUrl(testnet)}/api/v3/account?${queryString}&signature=${signature}`;
  const response = await axios.get(url, {
    headers: { 'X-MBX-APIKEY': apiKey }
  });
  
  const balances = response.data.balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
  
  // Close any positions by selling/buying back
  const baseAsset = symbol.replace(/USDT|BUSD|USDC$/, '');
  const baseBalance = balances.find((b: any) => b.asset === baseAsset);
  
  if (baseBalance && parseFloat(baseBalance.free) > 0) {
    onLog(`Closing ${baseBalance.free} ${baseAsset} position...`, 'trade');
    await placeMarketOrder(apiKey, apiSecret, symbol, 'SELL', parseFloat(baseBalance.free), testnet);
    onLog(`Position closed successfully`, 'success');
  }
}

export async function getAccountBalance(apiKey: string, apiSecret: string, testnet: boolean): Promise<any> {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = signQuery(queryString, apiSecret);
  
  const url = `${getBaseUrl(testnet)}/api/v3/account?${queryString}&signature=${signature}`;
  const response = await axios.get(url, {
    headers: { 'X-MBX-APIKEY': apiKey }
  });
  return response.data;
}

export async function getTickerPrice(testnet: boolean, symbol: string): Promise<number> {
  const url = `${getBaseUrl(testnet)}/api/v3/ticker/price?symbol=${symbol}`;
  const response = await axios.get(url);
  return parseFloat(response.data.price);
}
