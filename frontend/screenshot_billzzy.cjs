const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    });
    const page = await browser.newPage();

    // Set a mobile-like viewport
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    // Go to the URL
    await page.goto('https://lite.billzzy.com/', { waitUntil: 'networkidle0' });

    // Wait a few seconds for any install prompt animations
    await new Promise(r => setTimeout(r, 5000));

    await page.screenshot({ path: '/tmp/billzzy_mobile.png', fullPage: true });

    // Open desktop view as well
    await page.setViewport({ width: 1280, height: 800 });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: '/tmp/billzzy_desktop.png', fullPage: true });

    await browser.close();
    console.log('Screenshots saved to /tmp');
})();
