import React, { Fragment } from "react";
import manuals from "./manuals.json";
import "./App.css";

function App() {
  return (
    <>
      <h1>Manuals</h1>
      <a
        className="switch-online"
        href="https://www.nintendo.com/switch/online-service/nes/"
      >
        Play these games on Nintendo Switch Online
      </a>
      {Object.entries(manuals).map(([heading, games]) => (
        <Fragment key={heading}>
          <h2>{heading}</h2>
          <div className="collection">
            {games.map(({ game, manual, thumbnail }) => (
              <a key={game} href={manual}>
                <img src={thumbnail} alt={game} />
              </a>
            ))}
          </div>
        </Fragment>
      ))}
      <footer>
        <p>
          <small>
            This is not affiliated with Nintendo. All manuals are provided by
            Nintendo and are linked for informational purposes. When
            contributing or distributing this software, please respect the
            intellectual property of the original copyright holders.
          </small>
        </p>
      </footer>
    </>
  );
}

export default App;
