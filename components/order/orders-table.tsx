import Link from "next/link"
import { StatusTag } from "@/components/order/status-tag"
import { formatMoney, formatDate } from "@/lib/utils/format"

export type OrderRow = {
  id: string
  order_number?: string | null
  gigTitle: string
  sellerName?: string | null
  buyerName?: string | null
  status: string
  created_at: string
  delivery_due_at?: string | null
  amount: number
}

type Props = {
  orders: OrderRow[]
  /** whose name to show in the second column */
  party: "seller" | "buyer"
  /** show the due date instead of the placed date */
  due?: boolean
  caption: string
}

/* Orders as a table on desktop and a stacked list on phones. Gig title first, never the package name. */
export function OrdersTable({ orders, party, due = false, caption }: Props) {
  return (
    <div className="panel overflow-hidden">
      <table className="data-table hidden md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Gig</th>
            <th scope="col">{party === "seller" ? "Seller" : "Buyer"}</th>
            <th scope="col">Status</th>
            <th scope="col">{due ? "Ready by" : "Placed"}</th>
            <th scope="col" className="text-right">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="relative">
              <td className="max-w-[26rem]">
                <Link href={`/order/${o.id}`} className="font-semibold after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:underline">
                  {o.gigTitle}
                </Link>
                <span className="num mt-0.5 block text-xs text-ink-2">{o.order_number ?? o.id.slice(0, 8)}</span>
              </td>
              <td className="text-ink-2">{(party === "seller" ? o.sellerName : o.buyerName) ?? "Unknown"}</td>
              <td>
                <StatusTag status={o.status} />
              </td>
              <td className="num text-ink-2">{due ? (o.delivery_due_at ? formatDate(o.delivery_due_at, "MMM d") : "Not set") : formatDate(o.created_at, "MMM d, yyyy")}</td>
              <td className="num text-right">{formatMoney(o.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/order/${o.id}`} className="grid gap-2 p-4 transition-colors hover:bg-[#FAF9F6]">
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 font-semibold leading-snug">{o.gigTitle}</span>
                <span className="num shrink-0">{formatMoney(o.amount)}</span>
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-2">
                <StatusTag status={o.status} />
                <span>{(party === "seller" ? o.sellerName : o.buyerName) ?? ""}</span>
                <span className="num">{due ? (o.delivery_due_at ? `Ready by ${formatDate(o.delivery_due_at, "MMM d")}` : "") : formatDate(o.created_at, "MMM d, yyyy")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
