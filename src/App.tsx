import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mousePositions, setMousePositions] = useState({});

  const handleLogin = () => {
    if (name.trim()) {
      socket.emit("setName", name);
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const handleMouseMove = (event) => {
        const { clientX: x, clientY: y } = event;
        socket.emit("mouseMove", { x, y });
      };

      socket.on("mouseMove", (data) => {
        setMousePositions((prev) => ({
          ...prev,
          [data.sessionId]: {
            x: data.x,
            y: data.y,
            color: data.color,
            name: data.name,
          },
        }));
      });

      socket.on("allMousePositions", (positions) => {
        const positionsMap = positions.reduce((acc, pos) => {
          acc[pos.sessionId] = {
            x: pos.x,
            y: pos.y,
            color: pos.color,
            name: pos.name,
          };
          return acc;
        }, {});
        setMousePositions(positionsMap);
      });

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        socket.off("mouseMove");
        socket.off("allMousePositions");
      };
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleLogin}>Join</button>
      </div>
    );
  }

  return (
    <div>
      {Object.keys(mousePositions).map((sessionId) => (
        <div key={sessionId}>
          <div
            style={{
              position: "absolute",
              top: mousePositions[sessionId].y,
              left: mousePositions[sessionId].x,
              width: "10px",
              height: "10px",
              backgroundColor: mousePositions[sessionId].color,
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: mousePositions[sessionId].y + 15,
              left: mousePositions[sessionId].x,
              color: mousePositions[sessionId].color,
            }}
          >
            {mousePositions[sessionId].name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default App;
