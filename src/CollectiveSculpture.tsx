import { useId } from "react";

/** The actual OIC paths, lifted into a dimensional brand illustration. */
export function CollectiveSculpture() {
  const id = useId().replaceAll(":", "");
  const ring =
    "M18 2h28l16 16v28L46 62H18L2 46V18Zm3 8L10 21v22l11 11h22l11-11V21L43 10Z";
  const letters = "M17 22h7v20h-7ZM47 20h-9l-9 9v6l9 9h9v-7h-7l-4-4v-2l4-4h7Z";
  return (
    <svg
      className="collective-sculpture"
      viewBox="0 0 660 410"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-face`}
          x1="6"
          y1="0"
          x2="54"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fffef9" />
          <stop offset=".5" stopColor="#eeece3" />
          <stop offset="1" stopColor="#d4d0c4" />
        </linearGradient>
        <linearGradient
          id={`${id}-edge`}
          x1="0"
          y1="0"
          x2="64"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d3cfc4" />
          <stop offset=".45" stopColor="#ada99f" />
          <stop offset="1" stopColor="#e2dfd4" />
        </linearGradient>
        <linearGradient
          id={`${id}-oxide`}
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#eaa184" />
          <stop offset=".55" stopColor="#b84428" />
          <stop offset="1" stopColor="#8c301e" />
        </linearGradient>
        <filter
          id={`${id}-shadow`}
          x="-50%"
          y="-100%"
          width="200%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="17" />
        </filter>
      </defs>
      <ellipse
        cx="332"
        cy="307"
        rx="208"
        ry="38"
        fill="#292519"
        opacity=".16"
        filter={`url(#${id}-shadow)`}
      />
      {Array.from({ length: 13 }, (_, i) => 151 - i).map((y) => (
        <g key={y} transform={`matrix(4.6 1.6 -4.6 1.6 330 ${y})`}>
          <path d={ring} fill="#8c301e" fillRule="evenodd" />
          <path d={letters} fill="#8c301e" />
        </g>
      ))}
      <g transform="matrix(4.6 1.6 -4.6 1.6 330 139)">
        <path d={ring} fill={`url(#${id}-oxide)`} fillRule="evenodd" />
        <path d={letters} fill={`url(#${id}-oxide)`} />
      </g>
      <g className="sculpture-mark">
        {Array.from({ length: 25 }, (_, i) => 112 - i).map((y) => (
          <g key={y} transform={`matrix(4.6 1.6 -4.6 1.6 330 ${y})`}>
            <path d={ring} fill={`url(#${id}-edge)`} fillRule="evenodd" />
            <path d={letters} fill={`url(#${id}-edge)`} />
          </g>
        ))}
        <g transform="matrix(4.6 1.6 -4.6 1.6 330 88)">
          <path
            d={ring}
            fill={`url(#${id}-face)`}
            stroke="#fffdf6"
            strokeWidth=".25"
            fillRule="evenodd"
          />
          <path
            d={letters}
            fill={`url(#${id}-face)`}
            stroke="#fffdf6"
            strokeWidth=".25"
          />
        </g>
      </g>
    </svg>
  );
}
