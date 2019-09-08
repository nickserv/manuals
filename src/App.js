import React, { Fragment } from "react";
import manuals from "./manuals";
import "./App.css";

function App() {
  return (
    <>
      <h1>Manuals</h1>
      {Object.entries(manuals).map(([heading, games]) => (
        <Fragment key={heading}>
          <h2>{heading}</h2>
          <div className="collection">
            {games.map(({ game, manual, thumbnail }) => (
              <a key={game} href={manual}>
                {game}
                <br />
                <img src={thumbnail} alt="" />
              </a>
            ))}
          </div>
        </Fragment>
      ))}
    </>
  );
}

export default App;
