'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { IPO } from '@/lib/ipoData';

export default function IPOClient({ ipo }: { ipo: IPO | null }) {
    const router = useRouter();

    if (!ipo) {
        return <div className={styles.container}>IPO not found</div>;
    }

    return (
        <div className={styles.container}>
            <button onClick={() => router.back()} className={styles.backBtn}>
                ← Back to IPOs
            </button>

            <div className={styles.header}>
                <h1 className={styles.title}>{ipo.company} IPO Details</h1>
            </div>

            <div className={styles.grid}>
                <div className={styles.gridItem}>
                    <span className={styles.label}>Bidding dates</span>
                    <span className={styles.value}>{ipo.biddingDates || '--'}</span>
                </div>
                <div className={styles.gridItem}>
                    <span className={styles.label}>Minimum investment</span>
                    <span className={styles.value}>{ipo.minInvestment || '--'}</span>
                </div>
                <div className={styles.gridItem}>
                    <span className={styles.label}>Lot size</span>
                    <span className={styles.value}>{ipo.lotSize || '--'}</span>
                </div>
                <div className={styles.gridItem}>
                    <span className={styles.label}>Price range</span>
                    <span className={styles.value}>{ipo.priceRange || (ipo.issuePrice ? `₹${ipo.issuePrice}` : '--')}</span>
                </div>

                <div className={styles.gridItem}>
                    <span className={styles.label}>Issue size</span>
                    <span className={styles.value}>{ipo.issueSize || '--'}</span>
                </div>
                <div className={styles.gridItem}>
                    <span className={styles.label}>IPO doc</span>
                    {ipo.rhpPdfLink ? (
                        <a href={ipo.rhpPdfLink} className={styles.link} target="_blank" rel="noopener noreferrer">
                            RHP PDF ↗
                        </a>
                    ) : (
                        <span className={styles.value}>--</span>
                    )}
                </div>
                <div className={styles.gridItem}>
                    <span className={styles.label}>Tentative allotment date</span>
                    <span className={styles.value}>{ipo.tentativeAllotmentDate || '--'}</span>
                </div>
                <div className={styles.gridItem}>
                    <span className={styles.label}>Tentative listing date</span>
                    <span className={styles.value}>{ipo.tentativeListingDate || '--'}</span>
                </div>

                <div className={styles.gridItem}>
                    <span className={styles.label}>Face value</span>
                    <span className={styles.value}>{ipo.faceValue || '--'}</span>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.aboutSection}>
                    <h2 className={styles.sectionTitle}>About the Company</h2>
                    <p className={styles.description}>{ipo.description}</p>
                    <div className={styles.keyDetailsGrid}>
                        <div className={styles.keyDetailItem}>
                            <span className={styles.keyDetailLabel}>Founded in</span>
                            <span className={styles.keyDetailValue}>{ipo.foundedIn}</span>
                        </div>
                        <div className={styles.keyDetailItem}>
                            <span className={styles.keyDetailLabel}>Managing Director</span>
                            <span className={styles.keyDetailValue}>{ipo.mdCeo}</span>
                        </div>
                        <div className={styles.keyDetailItem}>
                            <span className={styles.keyDetailLabel}>Parent Organisation</span>
                            <span className={styles.keyDetailValue}>{ipo.parentOrg}</span>
                        </div>
                    </div>
                </div>

                {ipo.financials && (
                    <div className={styles.financialsSection}>
                        <h2 className={styles.sectionTitle}>Financials</h2>
                        <div className={styles.chartContainer}>
                            {(() => {
                                const parseValue = (str: string) => {
                                    const cleanStr = str.replace(/[₹, Cr]/g, '');
                                    return parseFloat(cleanStr);
                                };

                                const allValues = ipo.financials.flatMap(f => [
                                    parseValue(f.revenue),
                                    Math.abs(parseValue(f.profit)),
                                    f.assets ? parseValue(f.assets) : 0
                                ]);
                                const maxValue = Math.max(...allValues);

                                return ipo.financials.map((item, index) => {
                                    const revenue = parseValue(item.revenue);
                                    const profit = parseValue(item.profit);
                                    const assets = item.assets ? parseValue(item.assets) : 0;

                                    const getWidth = (val: number) => `${(Math.abs(val) / maxValue) * 100}%`;

                                    return (
                                        <div key={index} className={styles.yearGroup}>
                                            <h3 className={styles.yearLabel}>{item.year}</h3>

                                            {/* Revenue */}
                                            <div className={styles.barRow}>
                                                <span className={styles.barLabel}>Revenue</span>
                                                <div className={styles.barWrapper}>
                                                    <div
                                                        className={`${styles.bar} ${styles.revenueBar}`}
                                                        style={{ width: getWidth(revenue) }}
                                                    ></div>
                                                </div>
                                                <span className={styles.barValue}>{item.revenue}</span>
                                            </div>

                                            {/* Profit */}
                                            <div className={styles.barRow}>
                                                <span className={styles.barLabel}>Profit</span>
                                                <div className={styles.barWrapper}>
                                                    <div
                                                        className={`${styles.bar} ${profit >= 0 ? styles.positiveBar : styles.negativeBar}`}
                                                        style={{ width: getWidth(profit) }}
                                                    ></div>
                                                </div>
                                                <span className={`${styles.barValue} ${profit >= 0 ? styles.positive : styles.negative}`}>
                                                    {item.profit}
                                                </span>
                                            </div>

                                            {/* Assets */}
                                            {item.assets && (
                                                <div className={styles.barRow}>
                                                    <span className={styles.barLabel}>Assets</span>
                                                    <div className={styles.barWrapper}>
                                                        <div
                                                            className={`${styles.bar} ${styles.assetsBar}`}
                                                            style={{ width: getWidth(assets) }}
                                                        ></div>
                                                    </div>
                                                    <span className={styles.barValue}>{item.assets}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {(ipo.strengths || ipo.risks) && (
                    <div className={styles.analysisSection}>
                        <h2 className={styles.sectionTitle}>Analytical Answers & Insights</h2>
                        <div className={styles.analysisGrid}>
                            {ipo.strengths && (
                                <div className={styles.analysisCard}>
                                    <h3 className={`${styles.analysisHeader} ${styles.strengthHeader}`}>
                                        Strengths
                                    </h3>
                                    <ul className={styles.analysisList}>
                                        {ipo.strengths.map((item, i) => (
                                            <li key={i} className={styles.analysisItem}>
                                                <span className={styles.bullet}>✅</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {ipo.risks && (
                                <div className={styles.analysisCard}>
                                    <h3 className={`${styles.analysisHeader} ${styles.riskHeader}`}>
                                        Risks
                                    </h3>
                                    <ul className={styles.analysisList}>
                                        {ipo.risks.map((item, i) => (
                                            <li key={i} className={styles.analysisItem}>
                                                <span className={styles.bullet}>⚠️</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
