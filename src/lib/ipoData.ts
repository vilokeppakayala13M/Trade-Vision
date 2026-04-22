    export interface IPO {
    id: string;
    company: string;
    category?: string;
    date: string;
    subscription?: string;
    returns?: string;
    status?: string;
    hasDoc?: boolean;
    symbol?: string;
    issuePrice?: number;
    // Detailed fields
    biddingDates?: string;
    minInvestment?: string;
    lotSize?: number;
    priceRange?: string;
    issueSize?: string;
    rhpPdfLink?: string;
    tentativeAllotmentDate?: string;
    tentativeListingDate?: string;
    faceValue?: number;
    description?: string;
    foundedIn?: string;
    mdCeo?: string;
    parentOrg?: string;
    financials?: {
        year: string;
        revenue: string;
        profit: string;
        assets?: string;
    }[];
    strengths?: string[];
    risks?: string[];
}

// Exact data from Groww.in (December 2, 2025)
export const openIPOs: IPO[] = [
    {
        id: '1',
        company: 'Vidya Wires',
        category: 'Mainboard',
        date: '2-5 Dec',
        subscription: '0.45x',
        biddingDates: "2 Dec '25 - 5 Dec '25",
        minInvestment: "₹14,976",
        lotSize: 288,
        priceRange: "₹48 - ₹52",
        issueSize: "300.01 Cr",
        rhpPdfLink: "#",
        tentativeAllotmentDate: "08 Dec '25",
        tentativeListingDate: "10 Dec '25",
        faceValue: 10,
        description: "Vidya Wires is a leading manufacturer of copper wires and cables...",
        foundedIn: "2010",
        mdCeo: "Mr. Vidya Sagar",
        parentOrg: "Vidya Group"
    },
    {
        id: '2',
        company: 'Aequs',
        category: 'Mainboard',
        date: '2-5 Dec',
        subscription: '0.12x',
        biddingDates: "3 Dec '25 - 5 Dec '25",
        minInvestment: "₹14,880",
        lotSize: 120,
        priceRange: "₹118 - ₹124",
        issueSize: "921.81 Cr",
        rhpPdfLink: "#",
        tentativeAllotmentDate: "08 Dec '25",
        tentativeListingDate: "10 Dec '25",
        faceValue: 10,
        description: "Aequs is a diversified contract manufacturing company...",
        foundedIn: "2006",
        mdCeo: "Aravind Melligeri",
        parentOrg: "Aequs Pvt Ltd"
    },
    {
        id: '3',
        company: 'Meesho',
        category: 'Mainboard',
        date: '2-5 Dec',
        subscription: '1.20x',
        biddingDates: "3 Dec '25 - 5 Dec '25",
        minInvestment: "₹14,175",
        lotSize: 135,
        priceRange: "₹105 - ₹111",
        issueSize: "5,421.20 Cr",
        rhpPdfLink: "#",
        tentativeAllotmentDate: "08 Dec '25",
        tentativeListingDate: "10 Dec '25",
        faceValue: 1,
        description: "Meesho is a technology-based e-commerce platform in India that connects four main stakeholders – consumers, sellers, logistics partners, and content creators. The platform caters to a wide range of consumers across India.",
        foundedIn: "2015",
        mdCeo: "Mr Vidit Aatrey",
        parentOrg: "Meesho Ltd",
        financials: [
            { year: "FY 2025", revenue: "₹9,389 Cr", profit: "-₹3,942 Cr", assets: "₹10,500 Cr" },
            { year: "FY 2024", revenue: "₹7,615 Cr", profit: "-₹328 Cr", assets: "₹8,200 Cr" },
            { year: "FY 2023", revenue: "₹5,735 Cr", profit: "-₹1,675 Cr", assets: "₹6,800 Cr" }
        ],
        strengths: [
            "Strong market presence in tier-2 and tier-3 cities",
            "Asset-light business model with low inventory risk",
            "High user engagement and retention rates",
            "Diversified seller base across multiple categories"
        ],
        risks: [
            "Intense competition from established e-commerce giants",
            "Regulatory uncertainties in the e-commerce sector",
            "History of losses and path to profitability remains challenging",
            "Dependence on third-party logistics partners"
        ]
    },
    {
        id: '4',
        company: 'Shri Kanha Stainless',
        category: 'SME',
        date: '2-5 Dec',
        subscription: '2.30x',
        biddingDates: "3 Dec '25 - 5 Dec '25",
        minInvestment: "₹2,88,000",
        lotSize: 3200,
        priceRange: "₹90",
        issueSize: "Unknown",
        tentativeAllotmentDate: "08 Dec '25",
        tentativeListingDate: "10 Dec '25",
        faceValue: 10,
        description: "Shri Kanha Stainless specializes in stainless steel products...",
        foundedIn: "2018",
        mdCeo: "Mr. Kanha",
        parentOrg: "Shri Kanha Group"
    },
    {
        id: '5',
        company: 'Ravelcare',
        category: 'SME',
        date: '30 Nov - 3 Dec',
        subscription: '15.40x',
        biddingDates: "1 Dec '25 - 3 Dec '25",
        minInvestment: "₹2,60,000",
        lotSize: 1000,
        priceRange: "₹123 - ₹130",
        issueSize: "24.10 Cr",
        tentativeAllotmentDate: "04 Dec '25",
        tentativeListingDate: "08 Dec '25",
        faceValue: 10,
        description: "Ravelcare is involved in healthcare services...",
        foundedIn: "2019",
        mdCeo: "Dr. Ravel",
        parentOrg: "Ravelcare Ltd"
    },
    {
        id: '6',
        company: 'Invicta Diagnostic',
        category: 'SME',
        date: '30 Nov - 3 Dec',
        subscription: '8.90x',
        biddingDates: "1 Dec '25 - 3 Dec '25",
        minInvestment: "₹2,72,000",
        lotSize: 1600,
        priceRange: "₹80 - ₹85",
        issueSize: "28.12 Cr",
        tentativeAllotmentDate: "04 Dec '25",
        tentativeListingDate: "08 Dec '25",
        faceValue: 10,
        description: "Invicta Diagnostic operates a chain of diagnostic centers...",
        foundedIn: "2020",
        mdCeo: "Mr. Invicta",
        parentOrg: "Invicta Group"
    },
    {
        id: '7',
        company: 'Clear Secured',
        category: 'SME',
        date: '30 Nov - 3 Dec',
        subscription: '12.10x',
        biddingDates: "1 Dec '25 - 3 Dec '25",
        minInvestment: "₹2,64,000",
        lotSize: 1000,
        priceRange: "₹125 - ₹132",
        issueSize: "Unknown",
        tentativeAllotmentDate: "04 Dec '25",
        tentativeListingDate: "08 Dec '25",
        faceValue: 10,
        description: "Clear Secured Services provides facility management...",
        foundedIn: "2017",
        mdCeo: "Mr. Clear",
        parentOrg: "Clear Group"
    },
    {
        id: '8',
        company: 'Speb Adhesives',
        category: 'SME',
        date: '30 Nov - 3 Dec',
        subscription: '5.60x',
        biddingDates: "1 Dec '25 - 3 Dec '25",
        minInvestment: "₹2,24,000",
        lotSize: 2000,
        priceRange: "₹52 - ₹56",
        issueSize: "33.73 Cr",
        tentativeAllotmentDate: "04 Dec '25",
        tentativeListingDate: "08 Dec '25",
        faceValue: 10,
        description: "Speb Adhesives manufactures synthetic rubber adhesives...",
        foundedIn: "2012",
        mdCeo: "Mr. Speb",
        parentOrg: "Speb Ltd"
    },
    {
        id: '9',
        company: 'Astron Multigrain',
        category: 'SME',
        date: '30 Nov - 3 Dec',
        subscription: '3.40x',
        biddingDates: "1 Dec '25 - 3 Dec '25",
        minInvestment: "₹2,52,000",
        lotSize: 2000,
        priceRange: "₹63",
        issueSize: "18.40 Cr",
        tentativeAllotmentDate: "04 Dec '25",
        tentativeListingDate: "08 Dec '25",
        faceValue: 10,
        description: "Astron Multigrain is in the food processing industry...",
        foundedIn: "2015",
        mdCeo: "Mr. Astron",
        parentOrg: "Astron Group"
    },
    {
        id: '10',
        company: 'Neochem Bio',
        category: 'SME',
        date: '1-4 Dec',
        subscription: '4.50x',
        biddingDates: "2 Dec '25 - 4 Dec '25",
        minInvestment: "₹2,35,200",
        lotSize: 1200,
        priceRange: "₹93 - ₹98",
        issueSize: "44.97 Cr",
        tentativeAllotmentDate: "05 Dec '25",
        tentativeListingDate: "09 Dec '25",
        faceValue: 10,
        description: "Neochem Bio Solutions manufactures specialty chemicals...",
        foundedIn: "2016",
        mdCeo: "Mr. Neochem",
        parentOrg: "Neochem Ltd"
    },
    {
        id: '11',
        company: 'Helloji Holidays',
        category: 'SME',
        date: '1-4 Dec',
        subscription: '2.10x',
        biddingDates: "2 Dec '25 - 4 Dec '25",
        minInvestment: "₹2,83,200",
        lotSize: 1200,
        priceRange: "₹110 - ₹118",
        issueSize: "10.96 Cr",
        tentativeAllotmentDate: "05 Dec '25",
        tentativeListingDate: "09 Dec '25",
        faceValue: 10,
        description: "Helloji Holidays is a travel and tourism company...",
        foundedIn: "2019",
        mdCeo: "Mr. Hello",
        parentOrg: "Helloji Group"
    },
];

// Recently Closed IPOs (Not yet listed)
export const closedIPOs: IPO[] = [
    {
        id: '12',
        company: 'Mother Nutri Foods',
        category: 'SME',
        date: '28 Nov',
        subscription: '45.20x',
        biddingDates: "26 Nov '25 - 28 Nov '25",
        minInvestment: "₹2,80,800",
        lotSize: 1200,
        priceRange: "₹111 - ₹117",
        issueSize: "Unknown",
        tentativeAllotmentDate: "01 Dec '25",
        tentativeListingDate: "03 Dec '25",
        faceValue: 10,
        description: "Mother Nutri Foods is involved in food processing...",
        foundedIn: "2014",
        mdCeo: "Mrs. Mother",
        parentOrg: "Mother Group"
    },
    {
        id: '13',
        company: 'K K Silk Mills',
        category: 'SME',
        date: '28 Nov',
        subscription: '32.10x',
        biddingDates: "26 Nov '25 - 28 Nov '25",
        minInvestment: "₹2,28,000",
        lotSize: 3000,
        priceRange: "₹36 - ₹38",
        issueSize: "28.50 Cr",
        tentativeAllotmentDate: "01 Dec '25",
        tentativeListingDate: "03 Dec '25",
        faceValue: 10,
        description: "K K Silk Mills manufactures silk fabrics...",
        foundedIn: "2005",
        mdCeo: "Mr. KK",
        parentOrg: "KK Group"
    },
    {
        id: '14',
        company: 'SSMD Agrotech',
        category: 'SME',
        date: '27 Nov',
        subscription: '28.50x',
        biddingDates: "25 Nov '25 - 27 Nov '25",
        minInvestment: "₹2,42,000",
        lotSize: 1000,
        priceRange: "₹114 - ₹121",
        issueSize: "34.09 Cr",
        tentativeAllotmentDate: "28 Nov '25",
        tentativeListingDate: "02 Dec '25",
        faceValue: 10,
        description: "SSMD Agrotech deals in agricultural products...",
        foundedIn: "2013",
        mdCeo: "Mr. SSMD",
        parentOrg: "SSMD Group"
    },
];

// Recently Listed IPOs
export const listedIPOs: IPO[] = [
    { id: '15', company: 'Sudeep Pharma', date: '28 Nov 2025', returns: '18.5% gains', subscription: '52.40x', status: 'Listed', symbol: 'SUDEEP.NS', issuePrice: 145 },
    { id: '16', company: 'Tenneco Clean Air', date: '19 Nov 2025', returns: '12.3% gains', subscription: '35.60x', status: 'Listed', symbol: 'TENNECO.NS', issuePrice: 210 },
    { id: '17', company: 'Physicswallah (PWL)', date: '18 Nov 2025', returns: '45.2% gains', subscription: '85.40x', status: 'Listed', symbol: 'PWL.NS', issuePrice: 350 },
    { id: '18', company: 'National Bank (NaBFID)', date: '18 Nov 2025', returns: '8.9% gains', subscription: '12.30x', status: 'Listed', symbol: 'NABFID.NS', issuePrice: 100 },
    { id: '19', company: 'Groww (Billionbrains)', date: '12 Nov 2025', returns: '30.9% gains', subscription: '17.60x', status: 'Listed', symbol: 'GROWW.NS', issuePrice: 100 },
    { id: '20', company: 'Swiggy', date: '13 Nov 2025', returns: '7.69% gains', subscription: '3.59x', status: 'Listed', symbol: 'SWIGGY.NS', issuePrice: 390 },
];

export const upcomingIPOs: IPO[] = [
    { id: '21', company: 'InCred Holdings', date: 'To be announced', hasDoc: false },
    { id: '22', company: 'Hero Fincorp', date: 'To be announced', hasDoc: true },
    { id: '23', company: 'Allchem Lifescience', date: 'To be announced', hasDoc: false },
    { id: '24', company: 'Juniper Green Energy', date: 'To be announced', hasDoc: false },
    { id: '25', company: 'CarDekho', date: 'To be announced', hasDoc: false },
    { id: '26', company: 'Haldiram\'s Snacks Foods', date: 'To be announced', hasDoc: false },
    { id: '27', company: 'PharmEasy', date: 'To be announced', hasDoc: false },
    { id: '28', company: 'Flipkart', date: 'To be announced', hasDoc: false },
    { id: '29', company: 'OYO', date: 'To be announced', hasDoc: false },
    { id: '30', company: 'boAt', date: 'To be announced', hasDoc: false },
];

export const getAllIPOs = () => {
    return [...openIPOs, ...closedIPOs, ...listedIPOs, ...upcomingIPOs];
};

export const getIPOById = (id: string) => {
    return getAllIPOs().find(ipo => ipo.id === id);
};
