import "./index.css";
import { useState } from "react";

// function MyButton() {
//   const [cnt, setcnt] = useState(0);

//   function handleClick() {
//     setcnt(cnt+1);
//   }


//   return (
//     <button onClick={handleClick} >
//       you click me {cnt} times...
//     </button>
//   );
// }

export default function Profile() {
  const [showNous, setShowNous] = useState(false);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="nav-item">Index</div>

        <div className="nav-item indent">
          <span className="label">i.</span>
          <span className="underline">reading</span>
        </div>

        <div className="nav-item indent">
          <span className="label">ii.</span>
          <span className="underline">watching</span>
        </div>

        <div className="nav-item indent">
          <span className="label">iii.</span>
          <span className="underline">calendar</span>
        </div>

        <div className="nav-item indent">
          <span className="label">iv.</span>
          <span className="underline">notes</span>
        </div>

        <div className="nav-item indent">
          <span className="label">v.</span>
          <span className="underline">confession</span>
        </div>

        <div
          className="nav-item"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => setShowNous(true)}
        >
          nous
        </div>
      </aside>

      <div className="content">
        {showNous && (
          <div className="nous-block">
            <img
              src="/mypillow.jpg"
              alt="nous"
              style={{ maxWidth: "100%", marginTop: "40px" }}
            />
            <p className="nous-text">
              just go work tmr :) ily
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
