const puppeteer = require('puppeteer');

function main() {
    automateSearch();
}

async function automateSearch() {
    const browser = await puppeteer.launch({headless: false});
    const pages = await browser.pages();
    const page = pages[0];
    await page.setViewport({ width: 1035, height: 800 });
    await page.goto('https://google.com');
    await page.type('textarea#APjFqb.gLFyf', 'bumanan srirajan');
    // await page.click('input.gNO89b');
}

main()