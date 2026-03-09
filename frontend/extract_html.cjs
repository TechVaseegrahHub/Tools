const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    await page.goto('https://lite.billzzy.com/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));

    // Extract any element that might be the install prompt
    const installHtml = await page.evaluate(() => {
        // Look for common PWA prompt identifiers or text
        const elements = Array.from(document.querySelectorAll('*'));
        for (const el of elements) {
            if (
                (el.innerText && el.innerText.toLowerCase().includes('install')) ||
                (el.innerText && el.innerText.toLowerCase().includes('add to home')) ||
                (el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('install'))
            ) {
                // We only want significant UI blocks, not just a random text node in the footer
                if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && el.getBoundingClientRect().height > 20) {
                    // Return outerHTML of the parent container if it looks like a banner/modal
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 200) {
                        return {
                            html: el.outerHTML,
                            className: el.className,
                            text: el.innerText
                        };
                    }
                }
            }
        }
        return null;
    });

    console.log(JSON.stringify(installHtml, null, 2));
    await browser.close();
})();
