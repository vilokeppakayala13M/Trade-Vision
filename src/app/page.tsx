"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import StockCard from '@/components/StockCard';
import TryAgain from '@/components/TryAgain';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import styles from './page.module.css';
// import dynamic from 'next/dynamic';

// const List = dynamic(() => import('react-window').then((mod: any) => mod.FixedSizeList), { ssr: false }) as any;
// const AutoSizer = dynamic(() => import('react-virtualized-auto-sizer').then((mod: any) => mod.AutoSizer), { ssr: false }) as any;
import { useInView } from 'react-intersection-observer';
import { fetchStockQuotes, getStockSymbol, type StockQuote } from '@/lib/api';

const MOCK_STOCKS = [
  {
    id: 'reliance',
    name: 'Reliance Industries',
    symbol: 'RELIANCE',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'tcs',
    name: 'Tata Consultancy Svcs',
    symbol: 'TCS',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'hdfcbank',
    name: 'HDFC Bank Ltd',
    symbol: 'HDFCBANK',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'infy',
    name: 'Infosys Limited',
    symbol: 'INFY',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'icicibank',
    name: 'ICICI Bank Ltd',
    symbol: 'ICICIBANK',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'tatamotors',
    name: 'Tata Motors Ltd',
    symbol: 'TATAMOTORS',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'bhartiairtel',
    name: 'Bharti Airtel',
    symbol: 'BHARTIARTL',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'sbin',
    name: 'State Bank of India',
    symbol: 'SBIN',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'lici',
    name: 'Life Insurance Corporation',
    symbol: 'LICI',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'bajajfinsv',
    name: 'Bajaj Finance',
    symbol: 'BAJFINANCE',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'hindunilvr',
    name: 'Hindustan Unilever',
    symbol: 'HINDUNILVR',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'lt',
    name: 'Larsen & Toubro',
    symbol: 'LT',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'itc',
    name: 'ITC',
    symbol: 'ITC',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'maruti',
    name: 'Maruti Suzuki',
    symbol: 'MARUTI',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'mm',
    name: 'Mahindra & Mahindra',
    symbol: 'M&M',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'hcltech',
    name: 'HCL Technologies',
    symbol: 'HCLTECH',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'sunpharma',
    name: 'Sun Pharmaceutical',
    symbol: 'SUNPHARMA',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'kotakbank',
    name: 'Kotak Mahindra Bank',
    symbol: 'KOTAKBANK',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'axisbank',
    name: 'Axis Bank',
    symbol: 'AXISBANK',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'titan',
    name: 'Titan Company',
    symbol: 'TITAN',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'ultracemco',
    name: 'UltraTech Cement',
    symbol: 'ULTRACEMCO',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'bajajfinserv',
    name: 'Bajaj Finserv',
    symbol: 'BAJAJFINSV',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'adaniports',
    name: 'Adani Ports & SEZ',
    symbol: 'ADANIPORTS',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'ntpc',
    name: 'NTPC',
    symbol: 'NTPC',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'adanient',
    name: 'Adani Enterprises',
    symbol: 'ADANIENT',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'ongc',
    name: 'ONGC',
    symbol: 'ONGC',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'nestleind',
    name: 'Nestle India',
    symbol: 'NESTLEIND',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'powergrid',
    name: 'Power Grid Corporation',
    symbol: 'POWERGRID',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'sbilife',
    name: 'SBI Life Insurance',
    symbol: 'SBILIFE',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'britannia',
    name: 'Britannia Industries',
    symbol: 'BRITANNIA',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'drreddy',
    name: "Dr. Reddy's Laboratories",
    symbol: 'DRREDDY',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'coalindia',
    name: 'Coal India',
    symbol: 'COALINDIA',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'bajajauto',
    name: 'Bajaj Auto',
    symbol: 'BAJAJ-AUTO',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'cipla',
    name: 'Cipla',
    symbol: 'CIPLA',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'asianpaint',
    name: 'Asian Paints',
    symbol: 'ASIANPAINT',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'tatasteel',
    name: 'Tata Steel',
    symbol: 'TATASTEEL',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'jswsteel',
    name: 'JSW Steel',
    symbol: 'JSWSTEEL',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'grasim',
    name: 'Grasim Industries',
    symbol: 'GRASIM',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'indusindbk',
    name: 'IndusInd Bank',
    symbol: 'INDUSINDBK',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'eichermot',
    name: 'Eicher Motors',
    symbol: 'EICHERMOT',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'shreecem',
    name: 'Shree Cement',
    symbol: 'SHREECEM',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'wipro',
    name: 'Wipro',
    symbol: 'WIPRO',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'divislab',
    name: "Divi's Laboratories",
    symbol: 'DIVISLAB',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'hindalco',
    name: 'Hindalco Industries',
    symbol: 'HINDALCO',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'hdfclife',
    name: 'HDFC Life Insurance',
    symbol: 'HDFCLIFE',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'dabur',
    name: 'Dabur India',
    symbol: 'DABUR',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'sbicard',
    name: 'SBI Cards',
    symbol: 'SBICARD',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'icicipruli',
    name: 'ICICI Prudential Life',
    symbol: 'ICICIPRULI',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Mid Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'dmart',
    name: 'Avenue Supermarts',
    symbol: 'DMART',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Large Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  {
    id: 'gail',
    name: 'GAIL India',
    symbol: 'GAIL',
    price: 0,
    change: 0,
    changePercent: 0,
    type: 'Small Cap',
    data: Array.from({ length: 20 }, () => ({ value: 0 }))
  },
  { id: 'muthootfin', name: 'Muthoot Finance', symbol: 'MUTHOOTFIN', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'heromoto', name: 'Hero MotoCorp', symbol: 'HEROMOTOCO', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'cumminsind', name: 'Cummins India', symbol: 'CUMMINSIND', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'unionbank', name: 'Union Bank of India', symbol: 'UNIONBANK', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bse', name: 'BSE', symbol: 'BSE', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hdfcamc', name: 'HDFC AMC', symbol: 'HDFCAMC', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'polycab', name: 'Polycab India', symbol: 'POLYCAB', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'industower', name: 'Indus Towers', symbol: 'INDUSTOWER', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'dixon', name: 'Dixon Technologies', symbol: 'DIXON', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'indianb', name: 'Indian Bank', symbol: 'INDIANB', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hindpetro', name: 'Hindustan Petroleum', symbol: 'HINDPETRO', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'gmrinfra', name: 'GMR Airports Infra', symbol: 'GMRINFRA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bhartihex', name: 'Bharti Hexacom', symbol: 'BHARTIHEXA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'nhpc', name: 'NHPC', symbol: 'NHPC', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'persistent', name: 'Persistent Systems', symbol: 'PERSISTENT', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'maxhealth', name: 'Max Healthcare', symbol: 'MAXHEALTH', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'trent', name: 'Trent', symbol: 'TRENT', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'tatapower', name: 'Tata Power', symbol: 'TATAPOWER', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'tvsmotor', name: 'TVS Motor', symbol: 'TVSMOTOR', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'indhotel', name: 'Indian Hotels', symbol: 'INDHOTEL', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'voltas', name: 'Voltas', symbol: 'VOLTAS', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'aubank', name: 'AU Small Finance', symbol: 'AUBANK', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'coforge', name: 'Coforge', symbol: 'COFORGE', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'ltts', name: 'L&T Tech Services', symbol: 'LTTS', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'ltf', name: 'L&T Finance', symbol: 'L&TFH', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'shriramfin', name: 'Shriram Finance', symbol: 'SHRIRAMFIN', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bankindia', name: 'Bank of India', symbol: 'BANKINDIA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'federalbnk', name: 'Federal Bank', symbol: 'FEDERALBNK', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'canbk', name: 'Canara Bank', symbol: 'CANBK', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bharatforg', name: 'Bharat Forge', symbol: 'BHARATFORG', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'abb', name: 'ABB India', symbol: 'ABB', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'jswenergy', name: 'JSW Energy', symbol: 'JSWENERGY', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'tatachem', name: 'Tata Chemicals', symbol: 'TATACHEM', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'petronet', name: 'Petronet LNG', symbol: 'PETRONET', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'irfc', name: 'IRFC', symbol: 'IRFC', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'concor', name: 'Container Corp', symbol: 'CONCOR', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'mphasis', name: 'Mphasis', symbol: 'MPHASIS', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'srf', name: 'SRF', symbol: 'SRF', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'deepakntr', name: 'Deepak Nitrite', symbol: 'DEEPAKNTR', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'crompton', name: 'Crompton Greaves', symbol: 'CROMPTON', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'powerindia', name: 'Hitachi Energy', symbol: 'POWERINDIA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'gujgas', name: 'Gujarat Gas', symbol: 'GUJGASLTD', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'piind', name: 'PI Industries', symbol: 'PIIND', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'astral', name: 'Astral', symbol: 'ASTRAL', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'pageind', name: 'Page Industries', symbol: 'PAGEIND', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bel', name: 'Bharat Electronics', symbol: 'BEL', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'rec', name: 'REC Ltd', symbol: 'RECLLTD', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'pfc', name: 'Power Finance Corp', symbol: 'PFC', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'abcapital', name: 'Aditya Birla Cap', symbol: 'ABCAPITAL', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'lupin', name: 'Lupin', symbol: 'LUPIN', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'lauruslab', name: 'Laurus Labs', symbol: 'LAURUSLABS', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'mcx', name: 'MCX India', symbol: 'MCX', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'authum', name: 'Authum Inv', symbol: 'AUTHUM', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'radico', name: 'Radico Khaitan', symbol: 'RADICO', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'nh', name: 'Narayana Hrudayalaya', symbol: 'NH', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'kaynes', name: 'Kaynes Tech', symbol: 'KAYNES', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'poonawalla', name: 'Poonawalla Fincorp', symbol: 'POONAWALLA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'centralbk', name: 'Central Bank', symbol: 'CENTRALBK', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'chola', name: 'Cholamandalam Inv', symbol: 'CHOLAFIN', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'asterdm', name: 'Aster DM Health', symbol: 'ASTERDM', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'cdsl', name: 'CDSL', symbol: 'CDSL', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'godigit', name: 'Go Digit Insurance', symbol: 'GODIGIT', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'nbcc', name: 'NBCC India', symbol: 'NBCC', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hindcopper', name: 'Hindustan Copper', symbol: 'HINDCOPPER', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'grse', name: 'Garden Reach Ship', symbol: 'GRSE', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'delhivery', name: 'Delhivery', symbol: 'DELHIVERY', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'msumi', name: 'Motherson Wiring', symbol: 'MSUMI', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'navinfluor', name: 'Navin Fluorine', symbol: 'NAVINFLUOR', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'iti', name: 'ITI Ltd', symbol: 'ITI', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'gland', name: 'Gland Pharma', symbol: 'GLAND', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'iks', name: 'Inventurus Knowledge', symbol: 'IKS', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'starhealth', name: 'Star Health Ins', symbol: 'STARHEALTH', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'aegis', name: 'Aegis Logistics', symbol: 'AEGISCHEM', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'mrpl', name: 'MRPL', symbol: 'MRPL', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'jbche', name: 'JB Chemicals', symbol: 'JBCHEPHARM', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'granules', name: 'Granules India', symbol: 'GRANULES', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'vguard', name: 'V-Guard Ind', symbol: 'VGUARD', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'naukri', name: 'Info Edge', symbol: 'NAUKRI', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'camlin', name: 'Camlin Fine Sc', symbol: 'CAMLINFINE', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bajajelec', name: 'Bajaj Electricals', symbol: 'BAJAJELEC', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hikal', name: 'Hikal', symbol: 'HIKAL', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'caplin', name: 'Caplin Point', symbol: 'CAPLIPOINT', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bdl', name: 'Bharat Dynamics', symbol: 'BDL', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'transpek', name: 'Transpek Ind', symbol: 'TRANSPEK', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'jubilant', name: 'Jubilant Ingrevia', symbol: 'JUBLINGREA', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'namindia', name: 'Nippon Life AMC', symbol: 'NAM-INDIA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'knr', name: 'KNR Constructions', symbol: 'KNRCON', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'lemontree', name: 'Lemon Tree Hotels', symbol: 'LEMONTREE', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'manappuram', name: 'Manappuram Fin', symbol: 'MANAPPURAM', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'navkar', name: 'Navkar Corp', symbol: 'NAVKARCORP', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'sparc', name: 'SPARC', symbol: 'SPARC', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'alkyl', name: 'Alkyl Amines', symbol: 'ALKYLAMINE', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'sheela', name: 'Sheela Foam', symbol: 'SHEELA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'vmart', name: 'V-Mart Retail', symbol: 'VMART', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'beml', name: 'BEML', symbol: 'BEML', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hsil', name: 'AGI Greenpac (HSIL)', symbol: 'AGI', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'deltacorp', name: 'Delta Corp', symbol: 'DELTACORP', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'deepakfert', name: 'Deepak Fertilizers', symbol: 'DEEPAKFERT', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) }
];

export default function Home() {
  /* Use deterministic pseudo-random data for hydration consistency */
  const [stocks, setStocks] = useState(() => {
    // Simple seeded random function
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    return MOCK_STOCKS.map((s, index) => {
      // Use index or char codes as seed basis
      const seedBase = index * 1337 + s.symbol.length;

      const price = s.price || (seededRandom(seedBase) * 2000 + 100);
      const change = s.change || (seededRandom(seedBase + 1) * 40 - 20);
      const changePercent = s.changePercent || (seededRandom(seedBase + 2) * 4 - 2);

      return {
        ...s,
        price,
        change,
        changePercent,
        // Ensure pseudo-random sparkline data
        data: s.data.map((d, i) => ({ value: seededRandom(seedBase + 3 + i) * 100 }))
      };
    });
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isOnline = useNetworkStatus();

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCapFilter, setActiveCapFilter] = useState('all');
  
  // Lazy loading state
  const [loadLimit, setLoadLimit] = useState(20);
  const { ref: bottomRef, inView } = useInView({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && loadLimit < stocks.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadLimit(prev => Math.min(prev + 20, stocks.length));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, stocks.length]);

  const fetchMarketData = useCallback(async () => {
    try {
      console.log('Fetching data for all stocks...');

      const allSymbols = MOCK_STOCKS
        .slice(0, loadLimit)
        .map(stock =>
          stock.symbol ? (stock.symbol.includes('.') ? stock.symbol : `${stock.symbol}.NS`) : getStockSymbol(stock.id)
      );

      const CHUNK_SIZE = 50;
      const chunks = [];
      for (let i = 0; i < allSymbols.length; i += CHUNK_SIZE) {
        chunks.push(allSymbols.slice(i, i + CHUNK_SIZE));
      }

      const fetchChunk = async (chunk: string[]) => {
        try {
          return await fetchStockQuotes(chunk);
        } catch {
          return [];
        }
      };

      const allQuotes: StockQuote[] = [];
      for (const chunk of chunks) {
        const quotes = await fetchChunk(chunk);
        allQuotes.push(...quotes);
        await new Promise(r => setTimeout(r, 50));
      }

      console.log(`Received ${allQuotes.length} quotes total`);

      setStocks(prevStocks => {
        const nextStocks = [...prevStocks];

        allQuotes.forEach((quote) => {
          const stockIndex = nextStocks.findIndex(s => {
            const sSymbol = s.symbol ? (s.symbol.includes('.') ? s.symbol : `${s.symbol}.NS`) : getStockSymbol(s.id);
            return sSymbol === quote.symbol || sSymbol === quote.symbol?.replace('.NS', '');
          });

          if (stockIndex !== -1 && quote.c > 0) {
            nextStocks[stockIndex] = {
              ...nextStocks[stockIndex],
              price: quote.c,
              change: quote.d,
              changePercent: quote.dp,
              data: nextStocks[stockIndex].data.map((d, i) =>
                i === nextStocks[stockIndex].data.length - 1 ? { value: quote.c } : d
              )
            };
          }
        });
        return nextStocks;
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setLoading(false);
    }
  }, [loadLimit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [refreshKey, fetchMarketData]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const filteredStocks = useMemo(() => stocks.filter(stock => {
    const performanceMatch =
      activeFilter === 'all' ||
      (activeFilter === 'gainers' && stock.change > 0) ||
      (activeFilter === 'losers' && stock.change < 0);

    const capMatch =
      activeCapFilter === 'all' ||
      stock.type === activeCapFilter;

    return performanceMatch && capMatch;
  }), [stocks, activeFilter, activeCapFilter]);

  if (!isOnline) return <TryAgain />;

  return (
    <div className="container" style={{ maxWidth: '100%', padding: '0 1rem', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

      <section className={styles.section} style={{ flex: '0 0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0, fontSize: '1.25rem' }}>Market Movers ({filteredStocks.length})</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            style={{
              padding: '0.5rem',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </motion.button>
        </div>

        <div className={styles.filterContainer}>
          {['all', 'gainers', 'losers'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`${styles.filterButton} ${activeFilter === filter ? styles.activeFilter : ''}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.5rem' }} />
          {['all', 'Large Cap', 'Mid Cap', 'Small Cap'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveCapFilter(filter)}
              className={`${styles.filterButton} ${activeCapFilter === filter ? styles.activeFilter : ''}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <div style={{ flex: '1 1 auto', position: 'relative' }}>
        {filteredStocks.length === 0 && <div style={{ color: 'white', padding: '20px' }}>No stocks match current filters.</div>}
        {/* Temporarily disabled virtualization to ensure visibility */}
        {/* <AutoSizer>
          {({ height, width }: { height: number; width: number }) => {
            console.log('AutoSizer dims:', height, width);
            if (height === 0 || width === 0) return <div style={{ color: 'red' }}>AutoSizer has 0 size! ({width}x{height})</div>;

            const itemWidth = Math.max(MIN_CARD_WIDTH, (width - GAP) / Math.floor((width + GAP) / (MIN_CARD_WIDTH + GAP)));
            const numColumns = Math.floor(width / (MIN_CARD_WIDTH + GAP)) || 1;
            const rowHeight = 350;

            const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
              const startIndex = index * numColumns;
              const rowItems = filteredStocks.slice(startIndex, startIndex + numColumns);

              return (
                <div style={{ ...style, display: 'flex', gap: GAP }}>
                  {rowItems.map(stock => (
                    <div key={stock.id} style={{ flex: 1, minWidth: 0 }}>
                      <StockCard {...stock} />
                    </div>
                  ))}
                </div>
              );
            };

            return (
              <List
                height={height}
                itemCount={Math.ceil(filteredStocks.length / numColumns)}
                itemSize={rowHeight}
                width={width}
              >
                {Row}
              </List>
            );
          }}
        </AutoSizer> */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', paddingBottom: '24px' }}>
          {filteredStocks.slice(0, loadLimit).map(stock => (
            <div key={stock.id}>
              <StockCard {...stock} />
            </div>
          ))}
        </div>
        
        {/* Intersection Observer target for lazy loading */}
        {loadLimit < filteredStocks.length && (
          <div ref={bottomRef} style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Loading more...</span>
          </div>
        )}
      </div>

    </div>
  );
}
