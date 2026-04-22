import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">TradeVision</Link>
      </div>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>Home</Link>
        <Link href="/ipos" className={styles.link}>IPO&apos;s</Link>
        <Link href="/watchlist" className={styles.link}>Watchlist</Link>
        <Link href="/portfolio" className={styles.link}>Portfolio</Link>
      </div>
      <div className={styles.actions}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input type="text" placeholder="Search stocks..." />
        </div>
        <button className={styles.iconBtn}><Bell size={20} /></button>
        <Link href="/login" className={styles.loginBtn}>
          <User size={18} />
          <span>Login / Register</span>
        </Link>
      </div>
    </nav>
  );
}
