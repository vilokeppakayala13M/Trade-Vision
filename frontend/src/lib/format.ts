export function formatINR(amount: number, decimals = 2): string {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

export function formatINRCompact(amount: number): string {
    const absAmount = Math.abs(amount);
    if (absAmount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (absAmount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${formatINR(amount, 0)}`;
}

export function formatPnL(amount: number): string {
    const formatted = Math.abs(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return amount >= 0 ? `+₹${formatted}` : `-₹${formatted}`;
}
