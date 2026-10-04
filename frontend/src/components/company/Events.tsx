import styles from './Events.module.css';

interface EventItem {
    id: number;
    title: string;
    date: string;
    type: 'dividend' | 'result' | 'other';
}

interface EventsProps {
    events: EventItem[];
}

export default function Events({ events }: EventsProps) {
    return (
        <div className={styles.container}>
            {events.map(event => (
                <div key={event.id} className={styles.card}>
                    <div className={styles.dateBox}>
                        <span className={styles.month}>{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className={styles.day}>{new Date(event.date).getDate()}</span>
                    </div>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{event.title}</h3>
                        <span className={`${styles.type} ${styles[event.type]}`}>{event.type.toUpperCase()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
