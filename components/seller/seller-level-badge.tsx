import { LEVEL_LABELS } from "@/lib/utils/seller-levels";
import type { SellerLevel } from "@/types/database.types";
import { PinTile, type PinTileTone } from "@/components/ui/pin-tile";

interface Props {
  level: SellerLevel;
  className?: string;
}

const tones: Record<SellerLevel, PinTileTone> = {
  new_seller: "new",
  level_one: "level-one",
  level_two: "level-two",
  top_rated: "top-rated",
};

export function SellerLevelBadge({ level, className }: Props) {
  return (
    <PinTile tone={tones[level]} className={className}>
      {LEVEL_LABELS[level]}
    </PinTile>
  );
}
