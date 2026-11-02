import React from 'react';
import { HouseId } from '../types/parchis';

interface HouseEmblemProps {
  house: HouseId | 'hogwarts';
  className?: string;
  size?: number;
}

export const HouseEmblem: React.FC<HouseEmblemProps> = ({ house, className = '', size = 36 }) => {
  if (house === 'hogwarts') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" fill="#1e140d" stroke="#d4af37" strokeWidth="4" />
        {/* Hogwarts Castle Silhouette */}
        <path
          d="M26 68V48L32 40V68M42 68V34L50 22L58 34V68M68 68V42L74 48V68M20 72H80V78H20V72Z"
          fill="#f5d77f"
          stroke="#997a15"
          strokeWidth="1.5"
        />
        {/* Star Sparkles */}
        <circle cx="50" cy="18" r="3" fill="#ffffff" />
        <circle cx="34" cy="30" r="2" fill="#d4af37" />
        <circle cx="66" cy="30" r="2" fill="#d4af37" />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="#d4af37"
          fontFamily="Cinzel, serif"
          fontSize="15"
          fontWeight="900"
        >
          H
        </text>
      </svg>
    );
  }

  if (house === 'gryffindor') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield */}
        <path
          d="M50 8C74 8 86 16 86 42C86 68 50 92 50 92C50 92 14 68 14 42C14 16 26 8 50 8Z"
          fill="#8a111e"
          stroke="#d4af37"
          strokeWidth="4"
        />
        {/* Rampant Lion Stylized */}
        <path
          d="M48 24C44 24 41 27 41 31C41 35 44 38 48 38C46 42 42 45 42 50C42 56 46 60 52 60C56 60 60 57 60 53C64 54 68 52 68 47C68 43 64 41 61 41C61 36 57 32 52 32C52 28 50 24 48 24Z"
          fill="#f7d070"
        />
        <path
          d="M45 56L36 65M54 60L56 74M46 60L42 74M58 52L72 58"
          stroke="#f7d070"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Crown accent */}
        <polygon points="46,18 48,22 50,17 52,22 54,18 53,24 47,24" fill="#d4af37" />
      </svg>
    );
  }

  if (house === 'slytherin') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield */}
        <path
          d="M50 8C74 8 86 16 86 42C86 68 50 92 50 92C50 92 14 68 14 42C14 16 26 8 50 8Z"
          fill="#165b33"
          stroke="#c0c0c0"
          strokeWidth="4"
        />
        {/* Coiled Serpent */}
        <path
          d="M58 24C53 21 44 23 42 29C40 35 48 39 54 42C62 46 66 52 62 60C58 68 46 68 40 63C36 59 36 54 39 50"
          stroke="#e2e8f0"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="58" cy="24" r="4.5" fill="#e2e8f0" />
        <circle cx="60" cy="23" r="1.5" fill="#165b33" />
        {/* Serpent tongue */}
        <path d="M62 25L68 24M68 24L71 22M68 24L71 26" stroke="#ef4444" strokeWidth="1.5" />
      </svg>
    );
  }

  if (house === 'ravenclaw') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield */}
        <path
          d="M50 8C74 8 86 16 86 42C86 68 50 92 50 92C50 92 14 68 14 42C14 16 26 8 50 8Z"
          fill="#1e3a8a"
          stroke="#cd7f32"
          strokeWidth="4"
        />
        {/* Majestic Eagle soaring */}
        <path
          d="M50 30L60 22C66 28 72 38 70 48C64 44 58 46 50 54C42 46 36 44 30 48C28 38 34 28 40 22L50 30Z"
          fill="#cd7f32"
        />
        <path
          d="M50 54L44 68H56L50 54Z"
          fill="#b87333"
        />
        {/* Beak */}
        <polygon points="49,26 51,26 50,32" fill="#f59e0b" />
      </svg>
    );
  }

  // Hufflepuff
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield */}
      <path
        d="M50 8C74 8 86 16 86 42C86 68 50 92 50 92C50 92 14 68 14 42C14 16 26 8 50 8Z"
        fill="#c49a15"
        stroke="#1c1917"
        strokeWidth="4"
      />
      {/* Badger Silhouette with dual tone stripe */}
      <path
        d="M32 46C32 38 40 32 50 32C60 32 68 38 68 46C68 54 62 62 50 62C38 62 32 54 32 46Z"
        fill="#1c1917"
      />
      {/* Badger white snout and face stripe */}
      <path
        d="M46 32H54V50L50 54L46 50V32Z"
        fill="#ffffff"
      />
      <circle cx="43" cy="40" r="2" fill="#ffffff" />
      <circle cx="57" cy="40" r="2" fill="#ffffff" />
      {/* Badger paws */}
      <path d="M38 60L34 68M62 60L66 68" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};
