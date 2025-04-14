import { useEffect, useState } from "react";
import { RivalryMeter } from "./components/rivarly";
import "./home.css";
import music from "./assets/music.mp3";
import { Button3D } from "./components/button.components";

export const App = () => {
  const [audio] = useState(new Audio(music));
  const [isMusicStarted, setIsMusicStarted] = useState(false);
  useEffect(() => {
    const playMusic = () => {
      if (!isMusicStarted) {
        audio.loop = false;
        audio.volume = 0.1;
        audio.play().catch((err) => console.log("Autoplay blocked:", err));
        setIsMusicStarted(true);
      }
    };

    document.addEventListener("click", playMusic, { once: true });

    return () => document.removeEventListener("click", playMusic);
  }, [isMusicStarted, audio]);
  return (
    <div className="wrapper">
      <RivalryMeter />
      <div className="footer">
        <p>© 2025 Vote</p>
      </div>
    </div>
  );
};
