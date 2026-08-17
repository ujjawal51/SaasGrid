import InvoiceClaimForm from "@/app/_components/InvoiceClaimForm";

export const metadata = {
  title: "Cashback Claim | SaaTerra",
  description:
    "Submit your invoice and UPI ID to claim your software cashback. Our team will verify your order within 48-72 hours.",
};

export default function CashbackPage() {
  return <InvoiceClaimForm />;
}
