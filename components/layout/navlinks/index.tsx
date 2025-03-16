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
                    <span className="capitalize">{segment}</span>
                  </BreadcrumbPage>
                ) : (
                  <Link href={getSegmentPath(index)}>
                    <span className="capitalize">{segment}</span>
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
