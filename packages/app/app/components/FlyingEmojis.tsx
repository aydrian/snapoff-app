import type React from "react";

const emojis = ["📷", "🖼️", "🏞️", "📸", "🌄", "🌅", "🌠", "🎆"];

const topClasses = ["top-1/4", "top-2/4", "top-3/4", "top-[10%]", "top-[30%]", "top-[70%]", "top-[90%]"];
const scaleClasses = ["scale-50", "scale-75", "scale-100", "scale-125"];
const animationClasses = ["animate-float-slow", "animate-float-medium", "animate-float-fast"];

// Pre-generate positions and animations
const emojiData = emojis.map((emoji, index) => ({
  emoji,
  topClass: topClasses[index % topClasses.length],
  scaleClass: scaleClasses[index % scaleClasses.length],
  animationClass: animationClasses[index % animationClasses.length],
  left: `${(index * 12) % 100}%`,
}));

const FlyingEmojis: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {emojiData.map(({ emoji, topClass, scaleClass, animationClass, left }) => (
        <div
          key={`flying-emoji-${emoji}`}
          className={`absolute text-4xl opacity-50 ${topClass} ${scaleClass} ${animationClass}`}
          style={{ left }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default FlyingEmojis;