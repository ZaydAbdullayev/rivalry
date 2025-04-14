import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./index.css";
import trump from "../../assets/trump.png";
import earth from "../../assets/earth.png";
import trump_support from "../../assets/support-trump.png";
import earth_support from "../../assets/earth-support.png";
import spark from "../../assets/spark1.gif";
import support_voice from "../../assets/support.mp3";
import { saveCardAsImage } from "../../context/fetch.service";
import { Button3D } from "../button.components";

export const RivalryMeter = () => {
  const gaugeRef = useRef(null);
  const redRef = useRef(null);
  const blueRef = useRef(null);
  const [redPercent, setRedPercent] = useState(50);
  const [visitors, setVisitors] = useState(0);
  const [voted, setVoted] = useState(localStorage.getItem("voted") === "true");
  const [manyVotes, setManyVotes] = useState(null);
  const [audio] = useState(new Audio(support_voice));
  const [isMusicStarted, setIsMusicStarted] = useState(false);

  // Ses açma
  const playVoteSound = () => {
    audio.volume = 0.5;
    audio.play().catch((err) => console.log("Autoplay blocked:", err));
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0; // sıfırla
    }, 5000);
  };

  useEffect(() => {
    const playMusic = () => {
      if (!isMusicStarted) {
        audio.loop = false;
        audio.volume = 0;
        audio.play().catch((err) => console.log("Autoplay blocked:", err));
        setIsMusicStarted(true);
      }
    };

    document.addEventListener("click", playMusic, { once: true });

    return () => document.removeEventListener("click", playMusic);
  }, [isMusicStarted, audio]);

  // Oranları backend'den çek
  const fetchResults = async () => {
    try {
      const res = await fetch("https://rivalry-server.vercel.app/results");
      const data = await res.json();
      const total = data.votes.support + data.votes.oppose;
      setVisitors(data.visitors);

      if (total > 0) {
        const percent = Math.round((data.votes.support / total) * 100);
        setRedPercent(percent);

        if (percent > 50) {
          setManyVotes("trump");
        } else if (percent === 50) {
          setManyVotes("equal");
        } else {
          setManyVotes("earth");
        }
        playVoteSound();
        setTimeout(() => {
          setManyVotes(null);
        }, 5000);
      }
    } catch (err) {
      console.error("❌ Result fetch error:", err);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 15000);
    return () => clearInterval(interval);
  }, []);

  // GSAP animasyonları
  useEffect(() => {
    const bluePercent = 100 - redPercent;
    const angle = (redPercent - 50) * 1.8;

    gsap.to(gaugeRef.current, {
      rotate: `${angle}deg`,
      transformOrigin: "bottom center",
      duration: 1,
      ease: "power3.out",
    });

    gsap.to(redRef.current, {
      width: `${redPercent}%`,
      duration: 1,
      ease: "power2.out",
    });

    gsap.to(blueRef.current, {
      width: `${bluePercent}%`,
      duration: 1,
      ease: "power2.out",
    });
  }, [redPercent]);

  // Oy gönder
  const vote = async (choice) => {
    if (voted) return;

    try {
      const res = await fetch("https://rivalry-server.vercel.app/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: choice }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("voted", "true");
        setVoted(true);
        fetchResults();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("❌ Vote error:", err);
    }
  };

  const downloadCard = async () => {
    const cardElement = document.querySelector(".sides");
    saveCardAsImage(cardElement);
  };

  const changeSide = async () => {
    if (!voted) return;
    const res = await fetch("https://rivalry-server.vercel.app/change-side", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: voted ? "support" : "oppose" }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("voted", "false");
      setVoted(false);
      fetchResults();
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="rivalry-layout">
      <h1 className="title">RIVALRY METER</h1>
      <h2 className="subtitle">choose your side and support it</h2>
      <p className="voter-count">Visitors Count: {visitors}</p>
      <div className="sides">
        <div className="side red">
          <div className="icon">
            <img src={trump} alt="Trump" className="icon-img" />
          </div>
          <div className="label">USA</div>
          <div className="label">TARIFFS</div>
          <div className="percent">{redPercent}%</div>
          <button
            className="action-btn support"
            onClick={() => vote("support")}
            disabled={voted}
          >
            SUPPORT
          </button>
        </div>

        <div className="gauge-wrapper">
          <div className="gauge">
            <div className="needle" ref={gaugeRef}></div>
          </div>
          <div className="bar-wrapper">
            <div className="bar red-bar" ref={redRef}>
              <img src={spark} alt="Spark" className="spark" />
            </div>
            <div className="bar blue-bar" ref={blueRef}></div>
          </div>
        </div>

        <div className="side blue">
          <div className="icon">
            <img src={earth} alt="Earth" className="icon-img" />
          </div>
          <div className="label">The Rest of the World</div>
          <div className="label">TARIFFS</div>
          <div className="percent">{100 - redPercent}%</div>
          <button
            className="action-btn oppose"
            onClick={() => vote("oppose")}
            disabled={voted}
          >
            OPPOSE
          </button>
        </div>
        <div
          className={`earth support-img ${
            manyVotes === "earth" || manyVotes === "equal" ? "open" : "close"
          }`}
        >
          <img src={earth_support} alt="Earth Support" />
        </div>
        <div
          className={`trump support-img ${
            manyVotes === "trump" || manyVotes === "equal" ? "open" : "close"
          }`}
        >
          <img src={trump_support} alt="Trump Support" />
        </div>
      </div>
      <div className="btns">
        <Button3D label={"Download Rivalry Meter"} action={downloadCard} />
        <Button3D
          label={"X"}
          action={() => window.open(" https://x.com", "_blank")}
        />
        <Button3D label={"Change your side"} action={changeSide} />
      </div>
    </div>
  );
};
