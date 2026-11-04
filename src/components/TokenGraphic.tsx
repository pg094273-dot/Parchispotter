import React from 'react';
import { HouseId, HOUSES } from '../types/parchis';

interface TokenGraphicProps {
  house: HouseId;
  tokenId: number; // 0, 1, 2, 3
  isCurrentPlayer: boolean;
  isMovable: boolean;
  isSelected: boolean;
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const TokenGraphic: React.FC<TokenGraphicProps> = ({
  house,
  tokenId,
  isCurrentPlayer,
  isMovable,
  isSelected,
  onClick
}) => {
  const houseConfig = HOUSES[house];

  // Colors per house for the 3D coin styling
  const coinTheme = {
    gryffindor: {
      rimGrad: 'url(#rimGoldGrad)',
      gemGrad: 'url(#gemGryffindorGrad)',
      emblemColor: '#fef08a',
      emblemStroke: '#7f1d1d',
      badgeBorder: '#d4af37',
      auraColor: '#fbbf24',
      glow: '#ef4444'
    },
    slytherin: {
      rimGrad: 'url(#rimSilverGrad)',
      gemGrad: 'url(#gemSlytherinGrad)',
      emblemColor: '#f1f5f9',
      emblemStroke: '#064e3b',
      badgeBorder: '#cbd5e1',
      auraColor: '#34d399',
      glow: '#10b981'
    },
    ravenclaw: {
      rimGrad: 'url(#rimBronzeGrad)',
      gemGrad: 'url(#gemRavenclawGrad)',
      emblemColor: '#93c5fd',
      emblemStroke: '#1e3a8a',
      badgeBorder: '#cd7f32',
      auraColor: '#60a5fa',
      glow: '#3b82f6'
    },
    hufflepuff: {
      rimGrad: 'url(#rimGoldGrad)',
      gemGrad: 'url(#gemHufflepuffGrad)',
      emblemColor: '#fef08a',
      emblemStroke: '#78350f',
      badgeBorder: '#eab308',
      auraColor: '#fbbf24',
      glow: '#eab308'
    }
  }[house];

  return (
    <g
      className={`transition-transform duration-200 ${isCurrentPlayer ? 'cursor-pointer' : 'pointer-events-none'}`}
      onClick={onClick}
      transform={isSelected ? 'scale(1.16)' : 'scale(1)'}
    >
      {/* 1. SELECTION & MOVABLE GLOW / AURAS */}
      {isSelected && (
        <g>
          {/* Runic spinning selection ring */}
          <circle
            r="32"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeDasharray="6 3"
            className="animate-spin"
          />
          {/* Luminous beacon halo */}
          <circle
            r="38"
            fill="none"
            stroke="#fef08a"
            strokeWidth="1.5"
            className="animate-ping opacity-70"
          />
          <circle r="26" fill="rgba(251, 191, 36, 0.25)" />
        </g>
      )}

      {isMovable && !isSelected && (
        <g>
          {/* Pulsing wand magic ring */}
          <circle
            r="28"
            fill="none"
            stroke={coinTheme.auraColor}
            strokeWidth="3.5"
            strokeDasharray="5 2.5"
            className="animate-spin opacity-90"
          />
          <circle
            r="25"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            className="animate-ping opacity-60"
          />
        </g>
      )}

      {/* 2. ELEVATION SHADOW */}
      <ellipse
        cx="1"
        cy={isSelected ? '9' : '5'}
        rx={isSelected ? '22' : '19'}
        ry={isSelected ? '10' : '8'}
        fill="rgba(0,0,0,0.65)"
        filter="url(#tokenShadowFilter)"
      />

      {/* 3. HEAVY METALLIC BEVELED OUTER RIM */}
      <circle
        r="20"
        fill={coinTheme.rimGrad}
        stroke={isSelected ? '#ffffff' : '#1e140d'}
        strokeWidth="1.2"
      />
      {/* Coin milled ridges / inner groove */}
      <circle
        r="17.5"
        fill="none"
        stroke="#000000"
        strokeWidth="1"
        opacity="0.35"
      />
      <circle
        r="16.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* 4. DOMED ENAMEL / GEMSTONE CORE */}
      <circle
        r="15"
        fill={coinTheme.gemGrad}
      />

      {/* 5. SPECULAR LIGHT GLOSS CURVE (Physical Glass Dome Effect) */}
      <path
        d="M -11 -5 A 13 13 0 0 1 11 -5 A 12 7 0 0 0 -11 -5 Z"
        fill="#ffffff"
        opacity="0.32"
      />

      {/* 6. HERALDIC HOUSE ANIMAL EMBLEM */}
      {house === 'gryffindor' && (
        <g transform="translate(0, 0.5) scale(0.85)">
          {/* Rampant Golden Lion Crest */}
          <path
            d="M -3 -11 C -1 -12, 2 -12, 4 -10 C 5 -8, 3 -7, 5 -5 C 7 -6, 9 -4, 8 -2 C 6 -1, 4 -2, 3 1 C 4 3, 7 3, 8 5 C 8 6, 6 6, 5 5 C 4 8, 4 9, 2 11 C 0 12, -2 12, -4 10 C -4 8, -3 7, -5 7 C -7 8, -9 7, -9 5 C -7 4, -6 5, -5 3 C -6 2, -7 0, -6 -2 C -5 -3, -3 -3, -2 -5 C -4 -6, -5 -9, -3 -11 Z"
            fill="#fef08a"
            stroke="#92400e"
            strokeWidth="0.75"
          />
          {/* Lion Crown */}
          <polygon points="-4,-11 -2,-14 0,-11 2,-14 4,-11" fill="#fde047" stroke="#78350f" strokeWidth="0.5" />
          <circle cx="0" cy="-6" r="1.2" fill="#78350f" />
        </g>
      )}

      {house === 'slytherin' && (
        <g transform="translate(0, 0.5) scale(0.85)">
          {/* Coiled Basilisk Serpent */}
          <path
            d="M 3 -10 C 7 -10, 8 -7, 6 -5 C 4 -3, -2 -4, -4 -1 C -6 2, -5 5, -2 6 C 2 7, 5 5, 7 7 C 8 8, 7 11, 4 11 C 1 11, -3 10, -6 8 C -8 6, -8 2, -6 -1 C -4 -4, 1 -5, 3 -6 C 4 -7, 3 -8, 2 -9 C 1 -9, 0 -8, -1 -8 C -2 -9, 1 -10, 3 -10 Z"
            fill="#f1f5f9"
            stroke="#064e3b"
            strokeWidth="0.75"
          />
          {/* Emerald serpent eye */}
          <circle cx="5" cy="-8" r="1.2" fill="#10b981" />
          {/* Flickering tongue */}
          <path d="M 7 -7 L 10 -8 M 7 -7 L 10 -6" stroke="#ef4444" strokeWidth="0.6" strokeLinecap="round" />
        </g>
      )}

      {house === 'ravenclaw' && (
        <g transform="translate(0, 0.5) scale(0.85)">
          {/* Soaring Eagle / Raven */}
          <path
            d="M 0 -11 C 1 -11, 3 -9, 3 -7 C 5 -10, 8 -10, 9 -8 C 10 -6, 8 -3, 5 -1 C 7 1, 9 4, 8 6 C 7 7, 5 6, 4 4 C 3 7, 2 10, 0 11 C -2 10, -3 7, -4 4 C -5 6, -7 7, -8 6 C -9 4, -7 1, -5 -1 C -8 -3, -10 -6, -9 -8 C -8 -10, -5 -10, -3 -7 C -3 -9, -1 -11, 0 -11 Z"
            fill="#bfdbfe"
            stroke="#1e3a8a"
            strokeWidth="0.75"
          />
          {/* Beak & Eyes */}
          <polygon points="0,-10 2,-7 -2,-7" fill="#fbbf24" />
          <circle cx="0" cy="-6" r="1.2" fill="#0f172a" />
        </g>
      )}

      {house === 'hufflepuff' && (
        <g transform="translate(0, 0.5) scale(0.85)">
          {/* Noble Badger Profile */}
          <path
            d="M -7 5 C -8 3, -7 0, -5 -2 C -6 -4, -6 -7, -4 -9 C -2 -11, 2 -11, 4 -9 C 6 -7, 6 -4, 5 -2 C 7 0, 8 3, 7 5 C 6 8, 3 10, 0 11 C -3 10, -6 8, -7 5 Z"
            fill="#1c1917"
            stroke="#ca8a04"
            strokeWidth="0.75"
          />
          {/* Badger White Blaze & Eye Band */}
          <path
            d="M 0 -10 C -1 -7, -1 6, 0 9 C 1 6, 1 -7, 0 -10 Z"
            fill="#ffffff"
          />
          <path d="M -3 -6 L -3 0" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          <path d="M 3 -6 L 3 0" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
          <circle cx="-2" cy="-4" r="1" fill="#000000" />
          <circle cx="2" cy="-4" r="1" fill="#000000" />
          <circle cx="0" cy="8" r="1" fill="#fde047" />
        </g>
      )}

      {/* 7. WAX SEAL TOKEN NUMBER BADGE (High-contrast seal at upper right) */}
      <g transform="translate(13, -13)">
        {/* Seal border */}
        <circle
          r="8"
          fill="#110d0a"
          stroke={coinTheme.badgeBorder}
          strokeWidth="1.8"
        />
        {/* Token Number */}
        <text
          x="0"
          y="1"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9.5"
          fontFamily="Cinzel, serif"
          fontWeight="900"
          fill="#fef08a"
        >
          {tokenId + 1}
        </text>
      </g>
    </g>
  );
};
