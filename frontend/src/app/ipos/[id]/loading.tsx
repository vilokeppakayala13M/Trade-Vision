import styles from './page.module.css';

export default function Loading() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>Loading IPO Details...</div>
            </div>
        </div>
    );
}
