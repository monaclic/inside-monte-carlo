import Link from "next/link";

type PillLinkProps = {
  href: string;
  label: string;
};

export function PillLink({ href, label }: PillLinkProps) {
  return (
    <Link className="pill-link" href={href}>
      <span className="pill-link__track">
        <span className="pill-link__face">{label}</span>
        <span className="pill-link__face pill-link__face--back" aria-hidden="true">
          {label}
        </span>
      </span>
    </Link>
  );
}
