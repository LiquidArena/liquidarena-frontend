export default function GridPatternBackground() {
  return (
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
        backgroundSize: "50px 50px",
      }}
    ></div>
  );
}
