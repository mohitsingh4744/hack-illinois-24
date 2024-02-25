const puppeteer = require('puppeteer');

function main() {
    automateSearch("bumanan srirajan");
}

async function automateSearch(searchText) {
    const browser = await puppeteer.launch({headless: false});

    const pages = await browser.pages();
    const page = pages[0];

    await page.setViewport({ width: 1035, height: 800, deviceScaleFactor: 1 });
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`);
    
    console.log("Pop-up page is open. Close it manually to end.");
}

main()