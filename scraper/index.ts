import fs = require("fs");
import puppeteer = require("puppeteer");

interface Game {
  game: string;
  manual: string;
  thumbnail: string;
}

function sortGames(games: Game[]) {
  const lessThan = -1;
  const greaterThan = 1;
  const equalTo = 0;

  return games.sort(({ game: gameA }, { game: gameB }) => {
    if (gameA < gameB) return lessThan;
    if (gameA > gameB) return greaterThan;
    return equalTo;
  });
}

interface Scraper {
  url: string;
  execute(page: puppeteer.Page): Promise<Game[]>;
}

const scrapers: Record<string, Scraper> = {
  "Nintendo Entertainment System": {
    url: "https://www.nintendo.co.jp/clv/manuals/en/index.html",
    execute(page) {
      return page.evaluate(() =>
        Array.from(document.getElementsByClassName("gameBox")).map(node => ({
          game: node.querySelector(".gameTtl")!.textContent!,
          manual: (node.querySelector("a:nth-child(2)") as HTMLAnchorElement)
            .href,
          thumbnail: node.querySelector("img")!.src
        }))
      );
    }
  },
  "Super Nintendo Entertainment System": {
    url: "https://www.nintendo.co.jp/clvs/manuals/en_us/index.html",
    execute(page) {
      return page.evaluate(() =>
        Array.from(document.getElementsByClassName("soft")).map(node => ({
          game: node.querySelector(".gameTtl")!.childNodes[0].textContent!,
          manual: node.querySelector("a")!.href,
          thumbnail: node.querySelector("img")!.src.replace(".png", "_2x.png")
        }))
      );
    }
  }
};

async function executeScraper(browser: puppeteer.Browser, scraper: Scraper) {
  const page = await browser.newPage();
  await page.goto(scraper.url);
  return sortGames(await scraper.execute(page));
}

async function executeScrapers(
  browser: puppeteer.Browser
): Promise<Record<string, Game[]>> {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(scrapers).map(([consoleName, scraper]) =>
        Promise.all([consoleName, executeScraper(browser, scraper)])
      )
    )
  );
}

(async () => {
  const browser = await puppeteer.launch();

  try {
    const indentLevel = 2;
    await fs.promises.writeFile(
      "src/manuals.json",
      JSON.stringify(await executeScrapers(browser), undefined, indentLevel)
    );
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
