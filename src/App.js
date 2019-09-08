import React from "react";
import manuals from "./manuals";

function App() {
  return (
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
  );
}

export default App;
