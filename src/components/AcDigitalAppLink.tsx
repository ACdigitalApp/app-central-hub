import { cn } from "@/lib/utils";

interface AcDigitalAppLinkProps {
  className?: string;
  prefix?: string;
}

export function AcDigitalAppLink({ className, prefix }: AcDigitalAppLinkProps) {
  return (
    <a
      href="mailto:acdigital.app@gmail.com"
      className={cn(
        "text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline",
        className
      )}
      aria-label="Contatta AC Digital App via email"
    >
      {prefix}AC Digital App
    </a>
  );
}
