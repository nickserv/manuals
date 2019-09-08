import React, { Fragment } from "react";
import manuals from "./manuals";

function App() {
  return (
    <>
      {Object.entries(manuals).map(([heading, games]) => (
        <Fragment key={heading}>
          <h1>{heading}</h1>
          <ul>
            {games.map(({ game, manual, thumbnail }) => (
              <li key={game}>
                <a href={manual}>
                  {game}
                  <br />
                  <img src={thumbnail} alt="" />
                </a>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}

export default App;
