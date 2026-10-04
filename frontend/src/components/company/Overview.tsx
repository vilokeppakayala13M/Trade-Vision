import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Overview.module.css';

interface OverviewProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    company: any;
}

export default function Overview({ company }: OverviewProps) {
    return (
        <div className={styles.container}>
            {/* Performance Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>Performance</h3>
                <div className={styles.grid}>
                    <div className={styles.stat}>
                        <span>Volume</span>
                        <strong>{company.volume}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Today&apos;s Low/High</span>
                        <strong>{company.dayLow} / {company.dayHigh}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>52W Low/High</span>
                        <strong>{Number(company.yearLow).toFixed(2)} / {Number(company.yearHigh).toFixed(2)}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Open Price</span>
                        <strong>{company.open}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Prev. Close</span>
                        <strong>{company.prevClose}</strong>
                    </div>
                </div>
            </section>

            {/* Fundamentals Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>Fundamentals</h3>
                <div className={styles.grid}>
                    <div className={styles.stat}>
                        <span>Market Cap</span>
                        <strong>{company.mktCap}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>ROE</span>
                        <strong>{company.roe}%</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>EPS</span>
                        <strong>{company.eps}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>P/B Ratio</span>
                        <strong>{company.pbRatio}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Industry P/E</span>
                        <strong>{company.industryPe}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Book Value</span>
                        <strong>{company.bookValue}</strong>
                    </div>
                    <div className={styles.stat}>
                        <span>Debt to Equity</span>
                        <strong>{company.debtToEquity}</strong>
                    </div>
                </div>
            </section>

            {/* Financials Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>Financials</h3>
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={company.financials}>
                            <XAxis dataKey="year" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#141414', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="revenue" fill="#00ccff" name="Revenue" />
                            <Bar dataKey="profit" fill="#00ff88" name="Profit" />
                            <Bar dataKey="networth" fill="#ff0055" name="Net Worth" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* About Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>About Company</h3>
                <div style={{ marginBottom: '1rem', color: '#00ccff', fontSize: '1.1rem' }}>
                    <strong>MD/CEO: </strong> {company.mdCeo}
                </div>
                <p className={styles.text}>{company.about}</p>
            </section>

            {/* Share Holding Pattern Section */}
            <section className={styles.section}>
                <h3 className={styles.heading}>Share Holding Pattern</h3>
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            layout="vertical"
                            data={[
                                { name: 'Promoters', value: company.shareHolding.promoters, fill: '#00ff88' },
                                { name: 'FII', value: company.shareHolding.fii, fill: '#00ccff' },
                                { name: 'DII', value: company.shareHolding.dii, fill: '#ff0055' },
                                { name: 'Public', value: company.shareHolding.public, fill: '#ffffff' },
                            ]}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <XAxis type="number" stroke="#888" />
                            <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#141414', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            />
                            <Bar dataKey="value" name="Holding %" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
}
