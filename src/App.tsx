import { useState } from "react"

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

          <div className="nav-item indent ">
            <span className="label">v.</span>
            <span className="underline">confession</span>
          </div>

          <div className="nav-item ">
            <span className="underline">nous</span>
          </div>
        </aside>

      <main className="content">
      </main>
    </div>
  );
} 
