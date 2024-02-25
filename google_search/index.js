const puppeteer = require('puppeteer');

async function automateSearch(searchText) {
    const browser = await puppeteer.launch({headless: false});

    const pages = await browser.pages();
    const page = pages[0];

    await page.setViewport({ width: 1288, height: 800 });
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchText)}`);

    console.log("Popup page is open. Close it manually to end.");
}

module.exports.default = automateSearch;