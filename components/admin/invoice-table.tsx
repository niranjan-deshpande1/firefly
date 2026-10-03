import { StatusPill, Table, Td, Th, Time, type StatusTone } from "@/components/ui";
import { formatCents } from "@/lib/billing/math";
import { markInvoicePaidAction, markInvoiceSentAction } from "@/lib/admin/actions";
import { ActionButton } from "./action-button";

export type InvoiceRow = {
  id: string;
  number: string;
  type: string;
  description: string;
  amountCents: number;
  status: string;
  nonRefundable: boolean;
  issuedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  company: { name: string };
};

const TONE: Record<string, StatusTone> = { DRAFT: "neutral", SENT: "neutral", PAID: "success" };
const TYPE_LABEL: Record<string, string> = { FLAT_FEE: "cohort fee", HIRE_FEE: "hire fee" };

/**
 * Invoices for the operator (with mark sent and mark paid) or for one company (read only).
 * Flat fees always say non-refundable; there is no refund action anywhere.
 */
export function InvoiceTable({ invoices, operator, caption }: { invoices: InvoiceRow[]; operator: boolean; caption: string }) {
  return (
    <Table caption={caption}>
      <thead>
        <tr>
          <Th>invoice</Th>
          {operator ? <Th>company</Th> : null}
          <Th>for</Th>
          <Th className="text-end">amount</Th>
          <Th>status</Th>
          <Th>issued</Th>
          <Th>paid</Th>
          {operator ? <Th>action</Th> : null}
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id}>
            <Td className="whitespace-nowrap">{inv.number}</Td>
            {operator ? <Td>{inv.company.name}</Td> : null}
            <Td className="min-w-48">
              <p>{TYPE_LABEL[inv.type] ?? inv.type.toLowerCase()}</p>
              <p className="text-secondary">{inv.description}</p>
              {(inv.nonRefundable || inv.type === "FLAT_FEE") && !inv.description.includes("non-refundable") ? <p className="text-secondary">non-refundable</p> : null}
            </Td>
            <Td className="text-end whitespace-nowrap">{formatCents(inv.amountCents)}</Td>
            <Td>
              <StatusPill tone={TONE[inv.status] ?? "neutral"}>{inv.status.toLowerCase()}</StatusPill>
            </Td>
            <Td className="whitespace-nowrap">{inv.issuedAt ? <Time value={inv.issuedAt} /> : <span className="text-secondary">not issued</span>}</Td>
            <Td className="whitespace-nowrap">{inv.paidAt ? <Time value={inv.paidAt} /> : <span className="text-secondary">unpaid</span>}</Td>
            {operator ? (
              <Td>
                {inv.status === "SENT" ? <ActionButton action={markInvoicePaidAction} id={inv.id} label={<>mark paid<span className="sr-only"> for {inv.number}</span></>} loadingLabel="marking paid" /> : null}
                {inv.status === "DRAFT" ? <ActionButton action={markInvoiceSentAction} id={inv.id} label={<>send invoice<span className="sr-only"> {inv.number}</span></>} loadingLabel="sending invoice" /> : null}
                {inv.status === "PAID" ? <span className="text-secondary">no action</span> : null}
              </Td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
