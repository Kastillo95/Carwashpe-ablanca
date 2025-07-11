import { 
  Calendar, 
  Package, 
  FileText, 
  BarChart3, 
  Phone, 
  LayoutDashboard 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, adminOnly: false },
  { name: "Citas", href: "/appointments", icon: Calendar, adminOnly: false },
  { name: "Inventario", href: "/inventory", icon: Package, adminOnly: false },
  { name: "Facturación", href: "/billing", icon: FileText, adminOnly: true },
  { name: "Reportes", href: "/reports", icon: BarChart3, adminOnly: true },
  { name: "Contacto", href: "/contact", icon: Phone, adminOnly: false },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isAdminMode } = useAuth();

  const visibleNavigation = navigation.filter(item => 
    !item.adminOnly || isAdminMode
  );

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <nav className="p-4 space-y-2">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-brand-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
