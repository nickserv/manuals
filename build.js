const fs = require("fs");
const manuals = require("./manuals");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

ReactDOMServer.renderToStaticNodeStream(
  <>
    {Object.entries(manuals).map(([heading, games]) => (
      <>
        <h1>{heading}</h1>
        <ul>
          {Object.entries(games).map(([game, manual]) => (
            <li key={game}>
              <a href={manual}>{game}</a>
            </li>
          ))}
        </ul>
      </>
    ))}
  </>
).pipe(fs.createWriteStream("index.html"));
