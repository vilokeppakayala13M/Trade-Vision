
const fs = require('fs');
const path = require('path');

async function debug() {
    let output = '';
    const log = (...args) => {
        const msg = args.map(a =>
            typeof a === 'object' ? JSON.stringify(a, (k, v) => typeof v === 'function' ? '[Function]' : v, 2) : String(a)
        ).join(' ');
        output += msg + '\n';
        console.log(msg);
    };

    try {
        log('--- react-virtualized-auto-sizer ---');
        // Try dynamic import (simulate clean import)
        const autoSizerNamespace = await import('react-virtualized-auto-sizer');
        log('Namespace keys:', Object.keys(autoSizerNamespace));
        log('Namespace default:', typeof autoSizerNamespace.default);
        if (typeof autoSizerNamespace.default === 'object') {
            log('Namespace default keys:', Object.keys(autoSizerNamespace.default));
        }

        // Try require
        try {
            const autoSizerReq = require('react-virtualized-auto-sizer');
            log('Require type:', typeof autoSizerReq);
            log('Require keys:', Object.keys(autoSizerReq));
            log('Require default:', typeof autoSizerReq.default);
        } catch (e) {
            log('Require failed:', e.message);
        }

    } catch (e) {
        log('AutoSizer check failed:', e.message);
    }

    try {
        log('\n--- yahoo-finance2 ---');
        const yfNamespace = await import('yahoo-finance2');
        log('Namespace keys:', Object.keys(yfNamespace));
        log('Namespace default type:', typeof yfNamespace.default);

        if (yfNamespace.default) {
            log('Is default a class?', yfNamespace.default.toString().startsWith('class'));
            log('Is default an object?', typeof yfNamespace.default === 'object');
            log('Has quote function?', typeof yfNamespace.default.quote === 'function');
            log('Has suppressNotices?', typeof yfNamespace.default.suppressNotices === 'function');
        }

    } catch (e) {
        log('Yahoo Finance check failed:', e.message);
    }

    fs.writeFileSync('debug_output.txt', output);
}

debug();
