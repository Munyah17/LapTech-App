import "admin-lte/dist/css/adminlte.css";
import "./admin.css";
import { AdminLTEInit } from "./adminlte-init";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminLTEInit />
      {children}
    </>
  );
}
