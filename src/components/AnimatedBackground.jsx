import { motion as Motion, useReducedMotion } from "framer-motion";

export default function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();

  const waveProps = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, 20, 0] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      };

  const wavePropsSecondary = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, 15, 0] },
        transition: {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        },
      };

  const leafProps = prefersReducedMotion
    ? {}
    : {
        animate: { x: [0, 15, 0], rotate: [0, 360] },
        transition: {
          x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
        },
      };

  const toucanProps = prefersReducedMotion
    ? {}
    : {
        animate: { x: [0, 10, 0], y: [0, -10, 0] },
        transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
      };

  const pineappleProps = prefersReducedMotion
    ? {}
    : {
        animate: { rotate: [0, 360] },
        transition: { duration: 20, repeat: Infinity, ease: "linear" },
      };

  const surfboardProps = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, 15, 0], rotate: [-10, 10, -10] },
        transition: {
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        },
      };

  const volcanoProps = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, 5, 0] },
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <Motion.svg
        width="120%"
        height="40%"
        viewBox="0 0 800 200"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cdefff" />
            <stop offset="100%" stopColor="#00a9a5" />
          </linearGradient>
        </defs>
        <Motion.path
          d="M0 100 Q 100 150 200 100 T 400 100 T 600 100 T 800 100 V200 H0 Z"
          fill="url(#waveGradient)"
          {...waveProps}
        />
        <Motion.path
          d="M0 120 Q 150 170 300 120 T 600 120 T 800 120 V200 H0 Z"
          fill="url(#waveGradient)"
          opacity="0.5"
          {...wavePropsSecondary}
        />
      </Motion.svg>

      <Motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          pointerEvents: "none",
        }}
        aria-hidden="true"
        {...leafProps}
      >
        <defs>
          <linearGradient id="leafGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a4efc7" />
            <stop offset="100%" stopColor="#63c19e" />
          </linearGradient>
        </defs>
        <path
          d="M100 10 C140 40 160 100 100 190 C40 100 60 40 100 10 Z"
          fill="url(#leafGradient)"
        />
        <path
          d="M100 40 C110 80 110 120 100 160"
          stroke="#63c19e"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M100 80 C120 90 140 110 150 130"
          stroke="#63c19e"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M100 80 C80 90 60 110 50 130"
          stroke="#63c19e"
          strokeWidth="1.5"
          fill="none"
        />
      </Motion.svg>

      <Motion.svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          top: 80,
          left: 40,
          pointerEvents: "none",
        }}
        aria-hidden="true"
        {...toucanProps}
      >
        <circle cx="50" cy="60" r="20" fill="#000" />
        <circle cx="40" cy="55" r="5" fill="#fff" />
        <path d="M50 55 L90 45 L90 65 Z" fill="#ffa500" />
      </Motion.svg>

      <Motion.svg
        width="60"
        height="100"
        viewBox="0 0 60 100"
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          pointerEvents: "none",
        }}
        aria-hidden="true"
        {...pineappleProps}
      >
        <path d="M30 20 L20 0 L40 0 Z" fill="#5da130" />
        <ellipse
          cx="30"
          cy="60"
          rx="20"
          ry="30"
          fill="#f4c430"
          stroke="#d18b00"
          strokeWidth="2"
        />
        <path d="M15 45 L45 75 M45 45 L15 75" stroke="#d18b00" strokeWidth="2" />
      </Motion.svg>

      <Motion.svg
        width="40"
        height="120"
        viewBox="0 0 40 120"
        style={{
          position: "absolute",
          top: 120,
          right: 120,
          pointerEvents: "none",
        }}
        aria-hidden="true"
        {...surfboardProps}
      >
        <path
          d="M20 0 C35 40 35 80 20 120 C5 80 5 40 20 0 Z"
          fill="#fff"
          stroke="#00a9a5"
        />
        <line x1="20" y1="0" x2="20" y2="120" stroke="#00a9a5" strokeWidth="2" />
      </Motion.svg>

      <Motion.svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        style={{
          position: "absolute",
          bottom: 20,
          right: 40,
          pointerEvents: "none",
        }}
        aria-hidden="true"
        {...volcanoProps}
      >
        <path d="M20 100 L50 20 L80 100 Z" fill="#7b3f00" />
        <path d="M45 20 L55 20 L60 10 L40 10 Z" fill="#555" />
        <path d="M50 20 C50 20 45 40 60 40" stroke="#ff4500" strokeWidth="2" fill="none" />
      </Motion.svg>
    </div>
  );
}

