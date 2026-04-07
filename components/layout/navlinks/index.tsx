"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export default function NavLinks() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter((segment) => segment !== "");
  const getSegmentPath = (index: number) => {
    return "/" + segments.slice(0, index + 1).join("/");
  };

  const formatSegment = (segment: string) => {
    const parts = segment.split("-").filter(Boolean);
    if (parts.length === 0) return segment;
    const last = parts[parts.length - 1];
    if (/^[a-f0-9]{24}$/i.test(last)) {
      parts.pop();
    }
    return parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <nav className="px-8 py-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span>Início</span>
          </BreadcrumbItem>
          {segments.map((segment, index) => (
            <Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === segments.length - 1 ? (
                  <BreadcrumbPage>
                    <span className="capitalize">{formatSegment(segment)}</span>
                  </BreadcrumbPage>
                ) : (
                  <Link href={getSegmentPath(index)}>
                    <span className="capitalize">{formatSegment(segment)}</span>
                  </Link>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
