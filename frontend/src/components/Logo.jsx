import React from 'react';

export default function Logo({ size = 50, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#66401a" />

      {/* Leaves - Green Shades */}
      <circle cx="50" cy="30" r="18" fill="#1e7822" />
      <circle cx="35" cy="40" r="15" fill="#5aa916" opacity="0.9" />
      <circle cx="65" cy="40" r="15" fill="#5aa916" opacity="0.9" />

      {/* Trunk as Two Hands - White */}
      <path d="M42 80C42 80 35 70 35 55C35 45 42 42 45 42L50 52L55 42C58 42 65 45 65 55C65 70 58 80 58 80H42Z" fill="white" />
      <path d="M45 75C45 75 40 70 40 60C40 55 42 53 45 53C48 53 50 56 50 60C50 56 52 53 55 53C58 53 60 55 60 60C60 70 55 75 55 75H45Z" fill="#66401a" opacity="0.1" />

      {/* Stylized Wrist/Base */}
      <rect x="44" y="78" width="12" height="4" rx="2" fill="white" />
    </svg>
  );
}