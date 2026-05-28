import { cn } from "@/lib/utils";
import Link from "next/link";

interface Feature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: string;
  priceSuffix?: string;
  annualPrice?: string;
  description: string;
  features: Feature[];
  ctaLabel: string;
  ctaHref: string;
  badge?: string;
  microcopy?: string;
  highlighted?: boolean;
  className?: string;
}

export default function PlanCard({
  name,
  price,
  priceSuffix,
  annualPrice,
  description,
  features,
  ctaLabel,
  ctaHref,
  badge,
  microcopy,
  highlighted = false,
  className,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-8 transition-all duration-300",
        highlighted
          ? "border border-[#63b3ed] bg-gradient-to-b from-[#0d1620] to-[#0a1018] shadow-[0_0_40px_rgba(99,179,237,0.15)] scale-[1.02]"
          : "border border-white/10 bg-[#0d1219] hover:border-white/20",
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider",
              highlighted
                ? "bg-[#63b3ed] text-[#080c0f]"
                : "bg-white/10 text-white/70"
            )}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3
          className={cn(
            "font-serif text-xl mb-1",
            highlighted ? "text-[#63b3ed]" : "text-white/80"
          )}
        >
          {name}
        </h3>
        <p className="text-white/50 text-sm">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-4xl font-bold text-white">{price}</span>
          {priceSuffix && (
            <span className="text-white/40 text-sm">{priceSuffix}</span>
          )}
        </div>
        {annualPrice && (
          <p className="mt-1 text-sm text-emerald-400">
            ou <strong>{annualPrice}</strong> no plano anual
          </p>
        )}
        {microcopy && (
          <p className="mt-2 text-xs text-white/40 italic">{microcopy}</p>
        )}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-2.5 text-sm",
              feature.included ? "text-white/80" : "text-white/25 line-through"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex-shrink-0 text-base",
                feature.included ? (highlighted ? "text-[#63b3ed]" : "text-emerald-400") : "text-white/20"
              )}
            >
              {feature.included ? "✓" : "✕"}
            </span>
            {feature.text}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={cn(
          "block w-full rounded-xl py-3.5 text-center text-sm font-semibold tracking-wide transition-all duration-200",
          highlighted
            ? "bg-[#63b3ed] text-[#080c0f] hover:bg-[#90cdf4] shadow-lg shadow-[#63b3ed]/20"
            : "border border-white/20 text-white/80 hover:border-white/40 hover:text-white hover:bg-white/5"
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
