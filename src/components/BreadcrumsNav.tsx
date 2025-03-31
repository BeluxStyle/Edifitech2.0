"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs, Typography } from "@mui/material";

export default function BreadcrumbsNav() {
  const pathname = usePathname();

  // Dividir la ruta en partes y generar los breadcrumbs
  const pathSegments = pathname.split("/").filter(segment => segment);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const url = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    return isLast ? (
      <Typography key={url} color="text.primary">{decodeURIComponent(segment)}</Typography>
    ) : (
      <Link key={url} href={url} style={{ textDecoration: "none", color: "inherit" }}>
        {decodeURIComponent(segment)}
      </Link>
    );
  });

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>Inicio</Link>
      {breadcrumbItems}
    </Breadcrumbs>
  );
}
