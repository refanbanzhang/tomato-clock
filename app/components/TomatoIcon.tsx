interface TomatoIconProps {
  className?: string;
}

export default function TomatoIcon({ className = "w-7 h-7" }: TomatoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21c4.5 0 8-3.2 8-7.5C20 9.5 16.5 6 12 6S4 9.5 4 13.5C4 17.8 7.5 21 12 21Z"
        fill="#F97316"
      />
      <path
        d="M12 6c-1.2-2.2-3.8-3.5-6-3 1.2 1.8 3.2 3 6 3Z"
        fill="#14B8A6"
      />
      <path
        d="M12 6c1.2-2.2 3.8-3.5 6-3-1.2 1.8-3.2 3-6 3Z"
        fill="#0D9488"
      />
      <ellipse cx="9.5" cy="13" rx="1" ry="1.2" fill="white" fillOpacity="0.5" />
      <ellipse cx="14" cy="15" rx="0.8" ry="1" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
