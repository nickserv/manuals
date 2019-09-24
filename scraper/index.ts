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

function titleCase(text: string) {
  return text
    .split(/(?<splitter> |-)/u)
    .map(word => {
      if (/^[IVXLCDM:]+$/iu.test(word)) {
        return word.toUpperCase();
      }
      if (["of", "to", "the"].includes(word)) {
        return word.toLowerCase();
      }
      // eslint-disable-next-line no-magic-numbers
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

function normalizeGame(game: string) {
  const normalizedGame = titleCase(game.trim())
    .replace(/®|™/gu, "")
    .replace(/’/gu, "'")
    .replace("Bros ", "Bros. ");

  switch (normalizedGame) {
    case "Ghosts'n Goblins":
      return "Ghosts 'n Goblins";
    case "Startropics":
      return "StarTropics";
    case "Super Ghouls'n Ghosts":
      return "Super Ghouls 'n Ghosts";
    case "Yoshi's Island":
      return "Super Mario World 2: Yoshi's Island";
    default:
      return normalizedGame;
  }
}

function normalizeGames(games: Game[]) {
  return games.map(game => ({ ...game, game: normalizeGame(game.game) }));
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

const gotoOptions = { waitUntil: "domcontentloaded" } as const;

async function executeScraper(
  browser: puppeteer.Browser,
  scraper: Scraper,
  switchGames: string[]
) {
  const page = await browser.newPage();
  await page.goto(scraper.url, gotoOptions);
  return sortGames(
    normalizeGames(await scraper.execute(page)).filter(game =>
      switchGames.includes(game.game)
    )
  );
}

async function executeScrapers(
  browser: puppeteer.Browser
): Promise<Record<string, Game[]>> {
  const page = await browser.newPage();
  await page.goto(
    "https://www.nintendo.com/switch/online-service/nes/",
    gotoOptions
  );
  const switchGames = (await page.evaluate(() =>
    Array.from(document.getElementsByClassName("content-copy")).flatMap(node =>
      Array.from(node.childNodes)
        .map(childNode => childNode.textContent!)
        .filter(text => /\w/u.test(text))
    )
  )).map(normalizeGame);

  return Object.fromEntries(
    await Promise.all(
      Object.entries(scrapers).map(
        async ([consoleName, scraper]): Promise<[string, Game[]]> => [
          consoleName,
          await executeScraper(browser, scraper, switchGames)
        ]
      )
    )
  );
}

(async () => {
  const browser = await puppeteer.launch();

  try {
    const indentLevel = 2;
    const json = JSON.stringify(
      await executeScrapers(browser),
      undefined,
      indentLevel
    );
    await fs.promises.writeFile("src/manuals.json", `${json}\n`);
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
