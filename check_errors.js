const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('UNCAUGHT PAGE ERROR:', error.message);
    });

    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
        console.log('Page loaded completely. Check above for errors.');
    } catch (err) {
        console.log('Navigation failed:', err.message);
    }

    await browser.close();
})();
