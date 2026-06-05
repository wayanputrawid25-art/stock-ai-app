import { MarketingNav } from "@/components/nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      {children}
    </>
  );
}
