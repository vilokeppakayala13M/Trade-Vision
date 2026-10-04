import { WifiOff, RefreshCw } from 'lucide-react';
import styles from './TryAgain.module.css';

interface TryAgainProps {
    onRetry?: () => void;
}

export default function TryAgain({ onRetry }: TryAgainProps) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <WifiOff size={48} className={styles.icon} />
                </div>
                <h2 className={styles.title}>No Internet Connection</h2>
                <p className={styles.message}>
                    It looks like you&apos;re offline. Please check your network connection and try again.
                </p>
                <button
                    className={styles.retryButton}
                    onClick={() => onRetry ? onRetry() : window.location.reload()}
                >
                    <RefreshCw size={18} className={styles.retryIcon} />
                    Try Again
                </button>
            </div>
        </div>
    );
}
