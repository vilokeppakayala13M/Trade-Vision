"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import StockCard from '@/components/StockCard';
import StockRow from '@/components/StockRow';
import TryAgain from '@/components/TryAgain';
import SectorHeatmap from '@/components/SectorHeatmap';
import SortBar from '@/components/SortBar';
import ViewToggle from '@/components/ViewToggle';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import styles from './page.module.css';
import { useInView } from 'react-intersection-observer';
import { fetchStockQuotes, getStockSymbol, type StockQuote } from '@/lib/api';

const MOCK_STOCKS = [
  { id: 'reliance', name: 'Reliance Industries', symbol: 'RELIANCE', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'tcs', name: 'Tata Consultancy Svcs', symbol: 'TCS', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hdfcbank', name: 'HDFC Bank Ltd', symbol: 'HDFCBANK', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'infy', name: 'Infosys Limited', symbol: 'INFY', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'icicibank', name: 'ICICI Bank Ltd', symbol: 'ICICIBANK', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'tatamotors', name: 'Tata Motors Ltd', symbol: 'TATAMOTORS', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bhartiairtel', name: 'Bharti Airtel', symbol: 'BHARTIARTL', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'sbin', name: 'State Bank of India', symbol: 'SBIN', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'lici', name: 'Life Insurance Corporation', symbol: 'LICI', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bajajfinsv', name: 'Bajaj Finance', symbol: 'BAJFINANCE', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hindunilvr', name: 'Hindustan Unilever', symbol: 'HINDUNILVR', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'lt', name: 'Larsen & Toubro', symbol: 'LT', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'itc', name: 'ITC', symbol: 'ITC', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'maruti', name: 'Maruti Suzuki', symbol: 'MARUTI', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'mm', name: 'Mahindra & Mahindra', symbol: 'M&M', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'hcltech', name: 'HCL Technologies', symbol: 'HCLTECH', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'sunpharma', name: 'Sun Pharmaceutical', symbol: 'SUNPHARMA', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'kotakbank', name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'axisbank', name: 'Axis Bank', symbol: 'AXISBANK', price: 0, change: 0, changePercent: 0, type: 'Large Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'titan', name: 'Titan Company', symbol: 'TITAN', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'ultracemco', name: 'UltraTech Cement', symbol: 'ULTRACEMCO', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'bajajfinserv', name: 'Bajaj Finserv', symbol: 'BAJAJFINSV', price: 0, change: 0, changePercent: 0, type: 'Mid Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'adaniports', name: 'Adani Ports & SEZ', symbol: 'ADANIPORTS', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'ntpc', name: 'NTPC', symbol: 'NTPC', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'adanient', name: 'Adani Enterprises', symbol: 'ADANIENT', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'ongc', name: 'ONGC', symbol: 'ONGC', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'nestleind', name: 'Nestle India', symbol: 'NESTLEIND', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'powergrid', name: 'Power Grid Corporation', symbol: 'POWERGRID', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'sbilife', name: 'SBI Life Insurance', symbol: 'SBILIFE', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
  { id: 'britannia', name: 'Britannia Industries', symbol: 'BRITANNIA', price: 0, change: 0, changePercent: 0, type: 'Small Cap', data: Array.from({ length: 20 }, () => ({ value: 0 })) },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.025,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  }
};

const filterVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04
    }
  }
};

const chipVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3
    }
  }
};

export default function Home() {
  const [stocks, setStocks] = useState(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    return MOCK_STOCKS.map((s, index) => {
      const seedBase = index * 1337 + s.symbol.length;
      const price = s.price || (seededRandom(seedBase) * 2000 + 100);
      const change = s.change || (seededRandom(seedBase + 1) * 40 - 20);
      const changePercent = s.changePercent || (seededRandom(seedBase + 2) * 4 - 2);

      return {
        ...s,
        price,
        change,
        changePercent,
        data: s.data.map((d, i) => ({ value: price * (1 + (seededRandom(seedBase + 3 + i) * 0.04 - 0.02)) }))
      };
    });
  });

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const isOnline = useNetworkStatus();

  // Sort, Filter and View states
  const [currentSort, setCurrentSort] = useState('gainers');
  const [filter, setFilter] = useState<string>('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const [loadLimit, setLoadLimit] = useState(20);
  const { ref: bottomRef, inView } = useInView({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && loadLimit < stocks.length) {
      setLoadLimit(prev => Math.min(prev + 20, stocks.length));
    }
  }, [inView, stocks.length]);

  const fetchMarketData = useCallback(async () => {
    try {
      const allSymbols = MOCK_STOCKS
        .slice(0, loadLimit)
        .map(stock => stock.symbol ? (stock.symbol.includes('.') ? stock.symbol : `${stock.symbol}.NS`) : getStockSymbol(stock.id));

      const CHUNK_SIZE = 50;
      const chunks = [];
      for (let i = 0; i < allSymbols.length; i += CHUNK_SIZE) {
        chunks.push(allSymbols.slice(i, i + CHUNK_SIZE));
      }

      const allQuotes: StockQuote[] = [];
      for (const chunk of chunks) {
        try {
          const quotes = await fetchStockQuotes(chunk);
          allQuotes.push(...quotes);
        } catch { }
      }

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
              data: nextStocks[stockIndex].data.map((d, i) => {
                const oldPrice = nextStocks[stockIndex].price;
                const ratio = oldPrice > 0 ? quote.c / oldPrice : 1;
                return { value: i === nextStocks[stockIndex].data.length - 1 ? quote.c : d.value * ratio };
              })
            };
          }
        });
        return nextStocks;
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [loadLimit]);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [refreshKey, fetchMarketData]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const filteredStocks = useMemo(() => {
    let list = [...stocks];
    if (filter !== 'All') {
      list = list.filter(stock => stock.type === filter);
    }
    if (currentSort === 'gainers') {
      list.sort((a, b) => b.changePercent - a.changePercent);
    } else if (currentSort === 'losers') {
      list.sort((a, b) => a.changePercent - b.changePercent);
    } else if (currentSort === 'volume') {
      list.sort((a, b) => b.price - a.price); 
    } else if (currentSort === 'az') {
      list.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    return list;
  }, [stocks, currentSort, filter]);

  if (!isOnline) return <TryAgain />;

  return (
    <div className="container" style={{ maxWidth: '100%', padding: '0 1rem' }}>
      
      <SectorHeatmap />

      <section className={styles.section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Market Movers</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              style={{
                padding: '0.5rem',
                borderRadius: '50%',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </motion.button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <SortBar currentSort={currentSort} onSortChange={setCurrentSort} />
            <div style={{ width: '1px', height: '24px', background: 'var(--border-default)' }} />
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        <motion.div className={styles.filterContainer} variants={filterVariants} initial="hidden" animate="visible">
          {['All', 'Large Cap', 'Mid Cap', 'Small Cap'].map((category) => (
            <motion.button
              key={category}
              variants={chipVariants}
              className={`${styles.filterButton} ${filter === category ? styles.activeFilter : ''}`}
              onClick={() => setFilter(category)}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {view === 'grid' ? (
          <motion.div className={styles.grid} variants={containerVariants} initial="hidden" animate="visible">
            {filteredStocks.slice(0, loadLimit).map((stock) => (
              <motion.div variants={itemVariants} key={stock.id}>
                <StockCard {...stock} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className={styles.list}>
            {filteredStocks.slice(0, loadLimit).map((stock) => (
              <StockRow key={stock.id} {...stock} />
            ))}
          </div>
        )}

        <div ref={bottomRef} style={{ height: '40px', marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          {loading && loadLimit < stocks.length && (
            <RefreshCw size={24} className="spin" style={{ color: 'var(--text-2)' }} />
          )}
        </div>
      </section>
    </div>
  );
}
