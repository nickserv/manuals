import { useRect } from "@reach/rect";
import React, { Fragment, useRef } from "react";
import manuals from "./manuals";
import "./App.css";

function Manual({ game, manual, thumbnail }) {
  const ref = useRef();
  const rect = useRect(ref);

  return (
    <a href={manual} style={{ width: rect && rect.width }}>
      {game}
      <br />
      <img ref={ref} src={thumbnail} alt="" />
    </a>
  );
}

function App() {
  return (
    <>
      <h1>Manuals</h1>
      {Object.entries(manuals).map(([heading, games]) => (
        <Fragment key={heading}>
          <h2>{heading}</h2>
          <div className="collection">
            {games.map(manual => (
              <Manual key={manual.game} {...manual} />
            ))}
          </div>
        </Fragment>
      ))}
    </>
  );
}

export default App;
