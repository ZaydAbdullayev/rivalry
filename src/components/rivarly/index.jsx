import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./index.css";
import trump from "../../assets/trump.png";
import earth from "../../assets/earth.png";
import spark from "../../assets/spark1.gif";
import { Button3D } from "../button.components";
import { BiUser } from "react-icons/bi";

export const RivalryMeter = () => {
  const gaugeRef = useRef(null);
  const redRef = useRef(null);
  const blueRef = useRef(null);
  const [redPercent, setRedPercent] = useState(50);
  const [visitors, setVisitors] = useState(0);
  const [voted, setVoted] = useState(localStorage.getItem("voted") === "true");
  const [data, setData] = useState({});

  // Oranları backend'den çek
  const fetchResults = async () => {
    try {
      const res = await fetch("http://localhost:8088/results");
      const data = await res.json();
      const total = data.votes.support + data.votes.oppose;
      setVisitors(data.visitors);
      setData(data.votes);

      if (total > 0) {
        const percent = Math.round((data.votes.support / total) * 100);
        setRedPercent(percent);
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
      const res = await fetch("http://localhost:8088/vote", {
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

  return (
    <div className="rivalry-layout">
      <h1 className="title">Tariff Wars</h1>
      <h2 className="subtitle">choose your side and support it</h2>
      <p className="voter-count">Visitors Count: {visitors}</p>
      <div className="btns">
        <Button3D
          label={"X"}
          action={() => window.open(" https://x.com", "_blank")}
        />
      </div>
      <div className="sides">
        <div className="side red">
          <div className="icon">
            <img src={trump} alt="Trump" className="icon-img" />
          </div>
          <div className="label">USA</div>
          <div className="label">TARIFFS | SUPPORTER</div>
          <div className="percent">
            {redPercent}% | {data.support} <BiUser/>
          </div>
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
          <div className="label">TARIFFS | SUPPORTER</div>
          <div className="percent">
            {100 - redPercent}% | {data.oppose} <BiUser/>
          </div>
          <button
            className="action-btn oppose"
            onClick={() => vote("oppose")}
            disabled={voted}
          >
            OPPOSE
          </button>
        </div>
      </div>
    </div>
  );
};
