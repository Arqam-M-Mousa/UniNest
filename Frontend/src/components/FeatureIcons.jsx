import React from "react";
import {
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const BG = "#E8F4F8";
const STROKE = "#60B5EF";

export const VerifiedRentalsIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="40" cy="40" r="38" fill={BG} />
    <path
      d="M40 15L20 28V48C20 56 28 62 40 62C52 62 60 56 60 48V28L40 15Z"
      stroke={STROKE}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40 35C42.7614 35 45 32.7614 45 30C45 27.2386 42.7614 25 40 25C37.2386 25 35 27.2386 35 30C35 32.7614 37.2386 35 40 35Z"
      stroke={STROKE}
      strokeWidth="3"
    />
    <path d="M40 38V48" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const CampusHousingIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="40" cy="40" r="38" fill={BG} />
    <path
      d="M12 30L40 15L68 30V58C68 60 66 62 64 62H16C14 62 12 60 12 58V30Z"
      stroke={STROKE}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="18" y="38" width="10" height="12" fill={STROKE} />
    <rect x="35" y="38" width="10" height="12" fill={STROKE} />
    <rect x="52" y="38" width="10" height="12" fill={STROKE} />
    <path d="M30 62V48H50V62" stroke={STROKE} strokeWidth="3" />
  </svg>
);

export const AffordableHousingIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="40" cy="40" r="38" fill={BG} />
    <circle cx="40" cy="40" r="22" stroke={STROKE} strokeWidth="3" />
    <path
      d="M40 28v-4M40 52v-4M35.2 33.8c1-1.3 2.6-2.1 4.8-2.1 3.3 0 5.5 1.6 5.5 4.1 0 2.1-1.4 3.2-3.8 3.8l-2.2.6c-2.5.6-3.9 1.7-3.9 3.6 0 2.2 1.9 3.6 4.9 3.6 2.4 0 4-.9 4.9-2.3M40 28v6.1M40 45.9V48"
      stroke={STROKE}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default {
  VerifiedRentalsIcon,
  CampusHousingIcon,
  AffordableHousingIcon,
};
export const heroFeatureItems = [
  {
    key: "verifiedRentals",
    Icon: ShieldCheckIcon,
    bg: "bg-sky-100",
    color: "text-sky-400",
  },
  {
    key: "campusHousing",
    Icon: BuildingOfficeIcon,
    bg: "bg-sky-100",
    color: "text-sky-400",
  },
  {
    key: "affordableHousing",
    Icon: BanknotesIcon,
    bg: "bg-sky-100",
    color: "text-sky-400",
  },
];
