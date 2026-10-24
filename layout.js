export const metadata = { title: "後台管理", robots: { index: false, follow: false } };
export default function AdminLayout({ children }) {
  return <div className="admin">{children}</div>;
}
