import { LevelPlate } from "@/components/seller/SellerMark"
import type { SellerLevel } from "@/types/database.types"

/* new_seller, level_one, level_two, top_rated. Renders the level plate; the mapping lives in normalizeLevel. */
export function SellerLevelBadge({ level, className }: { level: SellerLevel; className?: string }) {
  return <LevelPlate level={level} className={className} />
}
