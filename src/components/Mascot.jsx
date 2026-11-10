
import React from "react";
import { motion } from "motion/react";

export const MASCOT_SRC = "/mascot/orinimo-mascot.png";

const animations = {
  float: {
    height: 22,
    rotate: 1,
    duration: 3.6,
  },

  bounce: {
    height: 28,
    rotate: 0,
    duration: 2.4,
  },

  cheer: {
    height: 20,
    rotate: 2,
    duration: 2.8,
  },

  calm: {
    height: 12,
    rotate: 0.5,
    duration: 4.5,
  },
};

export default function Mascot({
  size = 220,
  variant = "float",
  className = "",
  alt = "Maskot Orinimo",
  decorative = false,
  animated = true,
}) {
  const config = animations[variant] || animations.float;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: size,
        maxWidth: "100%",
      }}
    >
      <motion.img
        src={MASCOT_SRC}
        alt={decorative ? "" : alt}
        aria-hidden={decorative}
        draggable={false}
        width={size}
        height={size}
        className="orinimo-mascot block h-auto w-full select-none object-contain"
        style={{
          transformOrigin: "50% 70%",
          willChange: animated ? "transform" : "auto",
          backfaceVisibility: "hidden",
        }}
        initial={{
          y: 0,
          rotate: 0,
        }}
        animate={
          animated
            ? {
                y: [0, -config.height, 0],
                rotate: [0, config.rotate, 0],
              }
            : {
                y: 0,
                rotate: 0,
              }
        }
        transition={
          animated
            ? {
                duration: config.duration,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }
            : {
                duration: 0,
              }
        }
      />
    </div>
  );
}
