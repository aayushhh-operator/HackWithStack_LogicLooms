const XboxLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-xbox-dark">
      <svg
        width="200"
        height="160"
        viewBox="0 0 200 160"
        className="overflow-visible"
      >
        <defs>
          {/* X-shaped outline path */}
          <path
            id="loaderPath"
            d="M 20,30 L 70,30 L 100,80 L 130,30 L 180,30 L 180,40 L 135,40 L 100,95 L 65,40 L 20,40 Z M 20,120 L 70,120 L 100,70 L 130,120 L 180,120 L 180,130 L 135,130 L 100,75 L 65,130 L 20,130 Z"
            fill="none"
          />
          <path
            id="strokePath"
            d="M 20,30 L 70,30 L 100,80 L 130,30 L 180,30 L 180,40 L 135,40 L 100,95 L 100,80 L 100,70 L 130,120 L 180,120 L 180,130 L 135,130 L 100,75 L 65,130 L 20,130 L 20,120 L 70,120 L 100,70 L 100,95 L 65,40 L 20,40 Z"
            fill="none"
          />
          {/* Neon glow filter */}
          <filter id="xbox-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="7"
              floodColor="#65dc71"
              floodOpacity="1"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="15"
              floodColor="#65dc71"
              floodOpacity="0.6"
            />
          </filter>
        </defs>
        {/* Subtle background path */}
        <use
          href="#loaderPath"
          stroke="#17402c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.17"
        />
        {/* Animated neon green segments (all green, glow) */}
        <use
          href="#strokePath"
          stroke="#65dc71"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="80 640"
          strokeDashoffset="0"
          filter="url(#xbox-glow)"
          className="animate-segment-xbox-1"
        />
        <use
          href="#strokePath"
          stroke="#65dc71"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="80 640"
          strokeDashoffset="-240"
          filter="url(#xbox-glow)"
          className="animate-segment-xbox-2"
        />
        <use
          href="#strokePath"
          stroke="#65dc71"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="80 640"
          strokeDashoffset="-480"
          filter="url(#xbox-glow)"
          className="animate-segment-xbox-3"
        />
      </svg>
      <style>{`
        @keyframes slideSegmentXbox {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -720; }
        }
        .animate-segment-xbox-1 {
          animation: slideSegmentXbox 3s linear infinite;
        }
        .animate-segment-xbox-2 {
          animation: slideSegmentXbox 3s linear infinite;
          animation-delay: -1s;
        }
        .animate-segment-xbox-3 {
          animation: slideSegmentXbox 3s linear infinite;
          animation-delay: -2s;
        }
      `}</style>
    </div>
  );
};

export default XboxLoader;
