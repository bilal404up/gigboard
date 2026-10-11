import { SellerMark } from "@/components/seller/SellerMark"

/* No photo: a lit window sign seeded by the name, with the plain frame. Works for buyers and sellers. */
export function InitialAvatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  return <SellerMark username={name} size={size} label={name} className={className} />
}
