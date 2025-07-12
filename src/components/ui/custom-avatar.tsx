/* eslint-disable @next/next/no-img-element */
import { AvatarComponent } from "@rainbow-me/rainbowkit";

export default function CustomAvatar({
  address,
  size,
}: React.ComponentProps<AvatarComponent>) {
  if (address) {
    return (
      <img
        src={`https://api.dicebear.com/6.x/identicon/svg?seed=${address}`}
        alt="avatar"
        height={size}
        width={size}
      />
    );
  }
}
