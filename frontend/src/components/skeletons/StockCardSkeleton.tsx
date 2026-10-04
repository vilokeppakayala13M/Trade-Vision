"use client";

import styles from './StockCardSkeleton.module.css';

export default function StockCardSkeleton() {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <div className={`${styles.symbolSkeleton} ${styles.shimmer}`} />
                    <div className={`${styles.nameSkeleton} ${styles.shimmer}`} />
                </div>
                <div className={styles.priceContainer}>
                    <div className={`${styles.priceSkeleton} ${styles.shimmer}`} />
                    <div className={`${styles.changeSkeleton} ${styles.shimmer}`} />
                </div>
            </div>
            
            <div className={styles.spacer} />

            <div className={`${styles.chartSkeleton} ${styles.shimmer}`} />

            <div className={styles.footer}>
                <div className={`${styles.badgeSkeleton} ${styles.shimmer}`} />
                <div className={`${styles.btnSkeleton} ${styles.shimmer}`} />
            </div>
        </div>
    );
}
