import type React from "react";

type TextProps = {
  children: React.ReactNode;
};

function TextLabel({ children }: TextProps) {
  return (
    <span className="text-label uppercase text-ink-mute my-5 block">
      {children}
    </span>
  );
}

export default TextLabel;
