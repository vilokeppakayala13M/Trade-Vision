import { startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

export interface RBIEvent {
    date: string; // ISO 'YYYY-MM-DD'
    title: string;
    type: 'policy' | 'minutes' | 'announcement';
    description: string;
    impact: 'high' | 'medium' | 'low';
}

export interface MarketHoliday {
    date: string;
    name: string;
    exchanges: ('NSE' | 'BSE')[];
}

export interface FIIDIIData {
    date: string;
    fiiNet: number;
    diiNet: number;
    fiiGross: number;
    diiGross: number;
}

export interface EarningsEvent {
    date: string;
    symbol: string;
    name: string;
    exchange: 'NSE' | 'BSE';
    epsEstimate?: number;
    revenueEstimate?: number;
    quarter: string;
}

export interface CalendarEvent {
    id: string;
    date: string;
    title: string;
    category: 'rbi' | 'earnings' | 'holiday' | 'fii-dii' | 'dividend' | 'split' | 'agm';
    impact: 'high' | 'medium' | 'low';
    description: string;
    symbol?: string;
    meta?: Record<string, string | number>;
}

export const RBI_EVENTS_2025: RBIEvent[] = [
    { date: '2025-02-07', title: 'RBI MPC Decision', type: 'policy', description: 'RBI MPC decision on repo rate. Markets watch for rate cut signals amid inflation trajectory. High volatility expected in Bank Nifty and rate-sensitive sectors.', impact: 'high' },
    { date: '2025-02-21', title: 'RBI MPC Minutes', type: 'minutes', description: 'Release of the MPC meeting minutes providing insights into individual member views on inflation and growth.', impact: 'medium' },
    { date: '2025-04-09', title: 'RBI MPC Decision', type: 'policy', description: 'RBI MPC decision on repo rate. First meeting of the new financial year.', impact: 'high' },
    { date: '2025-04-23', title: 'RBI MPC Minutes', type: 'minutes', description: 'Release of the MPC meeting minutes.', impact: 'medium' },
    { date: '2025-05-30', title: 'RBI Annual Report', type: 'announcement', description: 'RBI releases its annual report detailing the state of the economy and central bank operations.', impact: 'medium' },
    { date: '2025-06-06', title: 'RBI MPC Decision', type: 'policy', description: 'RBI MPC decision on repo rate.', impact: 'high' },
    { date: '2025-06-20', title: 'RBI MPC Minutes', type: 'minutes', description: 'Release of the MPC meeting minutes.', impact: 'medium' },
    { date: '2025-08-07', title: 'RBI MPC Decision', type: 'policy', description: 'RBI MPC decision on repo rate.', impact: 'high' },
    { date: '2025-08-21', title: 'RBI MPC Minutes', type: 'minutes', description: 'Release of the MPC meeting minutes.', impact: 'medium' },
    { date: '2025-10-08', title: 'RBI MPC Decision', type: 'policy', description: 'RBI MPC decision on repo rate. Post-monsoon inflation review.', impact: 'high' },
    { date: '2025-10-22', title: 'RBI MPC Minutes', type: 'minutes', description: 'Release of the MPC meeting minutes.', impact: 'medium' },
    { date: '2025-12-05', title: 'RBI MPC Decision', type: 'policy', description: 'RBI MPC decision on repo rate. Year-end policy review.', impact: 'high' },
    { date: '2025-12-19', title: 'RBI MPC Minutes', type: 'minutes', description: 'Release of the MPC meeting minutes.', impact: 'medium' }
];

export const MARKET_HOLIDAYS_2025: MarketHoliday[] = [
    { date: '2025-01-26', name: 'Republic Day', exchanges: ['NSE', 'BSE'] },
    { date: '2025-02-26', name: 'Mahashivratri', exchanges: ['NSE', 'BSE'] },
    { date: '2025-03-14', name: 'Holi', exchanges: ['NSE', 'BSE'] },
    { date: '2025-04-14', name: 'Dr. Ambedkar Jayanti', exchanges: ['NSE', 'BSE'] },
    { date: '2025-04-18', name: 'Good Friday', exchanges: ['NSE', 'BSE'] },
    { date: '2025-05-01', name: 'Maharashtra Day', exchanges: ['NSE', 'BSE'] },
    { date: '2025-07-06', name: 'Muharram', exchanges: ['NSE', 'BSE'] },
    { date: '2025-08-15', name: 'Independence Day', exchanges: ['NSE', 'BSE'] },
    { date: '2025-08-27', name: 'Ganesh Chaturthi', exchanges: ['NSE', 'BSE'] },
    { date: '2025-10-02', name: 'Dussehra / Gandhi Jayanti', exchanges: ['NSE', 'BSE'] },
    { date: '2025-10-20', name: 'Diwali Laxmi Puja', exchanges: ['NSE', 'BSE'] },
    { date: '2025-10-21', name: 'Diwali Balipratipada', exchanges: ['NSE', 'BSE'] },
    { date: '2025-11-05', name: 'Gurunanak Jayanti', exchanges: ['NSE', 'BSE'] },
    { date: '2025-12-25', name: 'Christmas', exchanges: ['NSE', 'BSE'] }
];

const RAW_MOCK_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Svcs' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd' },
  { symbol: 'INFY', name: 'Infosys Limited' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'LICI', name: 'Life Insurance Corporation' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
  { symbol: 'LT', name: 'Larsen & Toubro' },
  { symbol: 'ITC', name: 'ITC' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra' },
  { symbol: 'HCLTECH', name: 'HCL Technologies' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
  { symbol: 'AXISBANK', name: 'Axis Bank' },
  { symbol: 'TITAN', name: 'Titan Company' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ' },
  { symbol: 'NTPC', name: 'NTPC' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises' },
  { symbol: 'ONGC', name: 'ONGC' },
  { symbol: 'NESTLEIND', name: 'Nestle India' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries' },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories" },
  { symbol: 'COALINDIA', name: 'Coal India' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto' },
  { symbol: 'CIPLA', name: 'Cipla' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints' },
  { symbol: 'TATASTEEL', name: 'Tata Steel' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel' },
  { symbol: 'GRASIM', name: 'Grasim Industries' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors' },
  { symbol: 'SHREECEM', name: 'Shree Cement' },
  { symbol: 'WIPRO', name: 'Wipro' },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories" },
  { symbol: 'HINDALCO', name: 'Hindalco Industries' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance' },
  { symbol: 'DABUR', name: 'Dabur India' },
  { symbol: 'SBICARD', name: 'SBI Cards' },
  { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life' },
  { symbol: 'DMART', name: 'Avenue Supermarts' },
  { symbol: 'GAIL', name: 'GAIL India' },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp' },
  { symbol: 'CUMMINSIND', name: 'Cummins India' },
  { symbol: 'UNIONBANK', name: 'Union Bank of India' },
  { symbol: 'BSE', name: 'BSE' },
  { symbol: 'HDFCAMC', name: 'HDFC AMC' },
  { symbol: 'POLYCAB', name: 'Polycab India' },
  { symbol: 'INDUSTOWER', name: 'Indus Towers' },
  { symbol: 'DIXON', name: 'Dixon Technologies' },
  { symbol: 'INDIANB', name: 'Indian Bank' },
  { symbol: 'HINDPETRO', name: 'Hindustan Petroleum' },
  { symbol: 'GMRINFRA', name: 'GMR Airports Infra' },
  { symbol: 'BHARTIHEXA', name: 'Bharti Hexacom' },
  { symbol: 'NHPC', name: 'NHPC' },
  { symbol: 'PERSISTENT', name: 'Persistent Systems' },
  { symbol: 'MAXHEALTH', name: 'Max Healthcare' },
  { symbol: 'TRENT', name: 'Trent' },
  { symbol: 'TATAPOWER', name: 'Tata Power' },
  { symbol: 'TVSMOTOR', name: 'TVS Motor' },
  { symbol: 'INDHOTEL', name: 'Indian Hotels' },
  { symbol: 'VOLTAS', name: 'Voltas' },
  { symbol: 'AUBANK', name: 'AU Small Finance' },
  { symbol: 'COFORGE', name: 'Coforge' },
  { symbol: 'LTTS', name: 'L&T Tech Services' },
  { symbol: 'L&TFH', name: 'L&T Finance' },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance' },
  { symbol: 'BANKINDIA', name: 'Bank of India' },
  { symbol: 'FEDERALBNK', name: 'Federal Bank' },
  { symbol: 'CANBK', name: 'Canara Bank' },
  { symbol: 'BHARATFORG', name: 'Bharat Forge' },
  { symbol: 'ABB', name: 'ABB India' },
  { symbol: 'JSWENERGY', name: 'JSW Energy' },
  { symbol: 'TATACHEM', name: 'Tata Chemicals' },
  { symbol: 'PETRONET', name: 'Petronet LNG' },
  { symbol: 'IRFC', name: 'IRFC' },
  { symbol: 'CONCOR', name: 'Container Corp' },
  { symbol: 'MPHASIS', name: 'Mphasis' },
  { symbol: 'SRF', name: 'SRF' },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite' },
  { symbol: 'CROMPTON', name: 'Crompton Greaves' },
  { symbol: 'POWERINDIA', name: 'Hitachi Energy' },
  { symbol: 'GUJGASLTD', name: 'Gujarat Gas' },
  { symbol: 'PIIND', name: 'PI Industries' },
  { symbol: 'ASTRAL', name: 'Astral' },
  { symbol: 'PAGEIND', name: 'Page Industries' },
  { symbol: 'BEL', name: 'Bharat Electronics' },
  { symbol: 'RECLLTD', name: 'REC Ltd' },
  { symbol: 'PFC', name: 'Power Finance Corp' },
  { symbol: 'ABCAPITAL', name: 'Aditya Birla Cap' },
  { symbol: 'LUPIN', name: 'Lupin' },
  { symbol: 'LAURUSLABS', name: 'Laurus Labs' },
  { symbol: 'MCX', name: 'MCX India' },
  { symbol: 'AUTHUM', name: 'Authum Inv' },
  { symbol: 'RADICO', name: 'Radico Khaitan' },
  { symbol: 'NH', name: 'Narayana Hrudayalaya' },
  { symbol: 'KAYNES', name: 'Kaynes Tech' },
  { symbol: 'POONAWALLA', name: 'Poonawalla Fincorp' },
  { symbol: 'CENTRALBK', name: 'Central Bank' },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Inv' },
  { symbol: 'ASTERDM', name: 'Aster DM Health' },
  { symbol: 'CDSL', name: 'CDSL' },
  { symbol: 'GODIGIT', name: 'Go Digit Insurance' },
  { symbol: 'NBCC', name: 'NBCC India' },
  { symbol: 'HINDCOPPER', name: 'Hindustan Copper' },
  { symbol: 'GRSE', name: 'Garden Reach Ship' },
  { symbol: 'DELHIVERY', name: 'Delhivery' },
  { symbol: 'MSUMI', name: 'Motherson Wiring' },
  { symbol: 'NAVINFLUOR', name: 'Navin Fluorine' },
  { symbol: 'ITI', name: 'ITI Ltd' },
  { symbol: 'GLAND', name: 'Gland Pharma' },
  { symbol: 'IKS', name: 'Inventurus Knowledge' },
  { symbol: 'STARHEALTH', name: 'Star Health Ins' },
  { symbol: 'AEGISCHEM', name: 'Aegis Logistics' },
  { symbol: 'MRPL', name: 'MRPL' },
  { symbol: 'JBCHEPHARM', name: 'JB Chemicals' },
  { symbol: 'GRANULES', name: 'Granules India' },
  { symbol: 'VGUARD', name: 'V-Guard Ind' },
  { symbol: 'NAUKRI', name: 'Info Edge' },
  { symbol: 'CAMLINFINE', name: 'Camlin Fine Sc' },
  { symbol: 'BAJAJELEC', name: 'Bajaj Electricals' },
  { symbol: 'HIKAL', name: 'Hikal' },
  { symbol: 'CAPLIPOINT', name: 'Caplin Point' },
  { symbol: 'BDL', name: 'Bharat Dynamics' },
  { symbol: 'TRANSPEK', name: 'Transpek Ind' },
  { symbol: 'JUBLINGREA', name: 'Jubilant Ingrevia' },
  { symbol: 'NAM-INDIA', name: 'Nippon Life AMC' },
  { symbol: 'KNRCON', name: 'KNR Constructions' },
  { symbol: 'LEMONTREE', name: 'Lemon Tree Hotels' },
  { symbol: 'MANAPPURAM', name: 'Manappuram Fin' },
  { symbol: 'NAVKARCORP', name: 'Navkar Corp' },
  { symbol: 'SPARC', name: 'SPARC' },
  { symbol: 'ALKYLAMINE', name: 'Alkyl Amines' },
  { symbol: 'SHEELA', name: 'Sheela Foam' },
  { symbol: 'VMART', name: 'V-Mart Retail' },
  { symbol: 'BEML', name: 'BEML' },
  { symbol: 'AGI', name: 'AGI Greenpac (HSIL)' },
  { symbol: 'DELTACORP', name: 'Delta Corp' },
  { symbol: 'DEEPAKFERT', name: 'Deepak Fertilizers' }
];

export const TRACKED_STOCKS: { symbol: string, name: string, sector: string }[] = RAW_MOCK_STOCKS.map(s => {
    let sector = 'Other';
    const energy = ['RELIANCE', 'ONGC', 'HINDPETRO', 'GAIL', 'PETRONET', 'NTPC', 'POWERGRID', 'COALINDIA', 'JSWENERGY'];
    const it = ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'MPHASIS', 'COFORGE', 'LTTS', 'PERSISTENT', 'DIXON'];
    const banking = ['HDFCBANK', 'ICICIBANK', 'AXISBANK', 'KOTAKBANK', 'SBIN', 'INDUSINDBK', 'FEDERALBNK', 'AUBANK', 'CANBK', 'UNIONBANK', 'INDIANB', 'CENTRALBK', 'BANKINDIA'];
    const pharma = ['SUNPHARMA', 'CIPLA', 'DRREDDY', 'LUPIN', 'DIVISLAB', 'LAURUSLABS', 'GRANULES', 'GLAND'];
    const auto = ['MARUTI', 'TATAMOTORS', 'HEROMOTOCO', 'BAJAJ-AUTO', 'TVSMOTOR', 'EICHERMOT', 'M&M', 'BHARATFORG'];
    const telecom = ['RELIANCE', 'BHARTIARTL', 'BHARTIHEXA', 'INDUSTOWER'];

    if (energy.includes(s.symbol)) sector = 'Energy';
    else if (it.includes(s.symbol)) sector = 'IT';
    else if (banking.includes(s.symbol)) sector = 'Banking';
    else if (pharma.includes(s.symbol)) sector = 'Pharma';
    else if (auto.includes(s.symbol)) sector = 'Auto';
    else if (telecom.includes(s.symbol)) sector = 'Telecom';

    return { ...s, sector };
});

export function getEventColor(category: CalendarEvent['category']): string {
    switch (category) {
        case 'rbi': return '#6366f1';
        case 'earnings': return '#0ea5e9';
        case 'holiday': return '#ef4444';
        case 'fii-dii': return '#10b981';
        case 'dividend': return '#f59e0b';
        case 'split': return '#8b5cf6';
        case 'agm': return '#ec4899';
        default: return '#94a3b8';
    }
}

export function getImpactLabel(impact: string): string {
    switch (impact) {
        case 'high': return 'High Impact';
        case 'medium': return 'Medium Impact';
        case 'low': return 'Low Impact';
        default: return 'Unknown Impact';
    }
}

export function generateCalendarGrid(year: number, month: number): (Date | null)[][] {
    const firstDay = startOfMonth(new Date(year, month));
    const lastDay = endOfMonth(firstDay);
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    // getDay returns 0 for Sunday, 1 for Monday. We want 0 for Monday.
    let startPadding = getDay(firstDay) - 1;
    if (startPadding < 0) startPadding = 6; // Sunday becomes 6
    
    const grid: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = Array(startPadding).fill(null);
    
    daysInMonth.forEach(day => {
        if (currentWeek.length === 7) {
            grid.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });
    
    while (currentWeek.length < 7) {
        currentWeek.push(null);
    }
    grid.push(currentWeek);
    
    // Ensure 6 rows
    while (grid.length < 6) {
        grid.push(Array(7).fill(null));
    }
    
    return grid;
}
