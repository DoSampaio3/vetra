import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: React.ElementType;
}

export default function SectionWrapper({
  children,
  className,
  id,
  as: Tag = "section",
}: SectionWrapperProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32",
        className
      )}
      style={{ background: "linear-gradient(180deg, #020817 0%, #050d1f 100%)" }}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </Tag>
  );
}
