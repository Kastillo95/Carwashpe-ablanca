import { Car, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { BUSINESS_INFO } from "@/lib/constants";
import { PasswordModal } from "@/components/modals/password-modal";
import { useState } from "react";
import logoImage from "@assets/IMG_20250706_211100_1752220069225.jpg";

export function Header() {
  const { isAdminMode, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <header className="bg-brand-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden">
              <img 
                src={logoImage} 
                alt="Carwash Peña Blanca Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">{BUSINESS_INFO.name.toUpperCase()}</h1>
              <p className="text-sm text-blue-200">Sistema de Gestión</p>
            </div>
          </div>
          
          {/* Admin Toggle */}
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Modo: <span className="font-medium">{isAdminMode ? "Administrador" : "Usuario"}</span>
            </span>
            <Button
              onClick={() => {
                if (isAdminMode) {
                  logout();
                } else {
                  setShowPasswordModal(true);
                }
              }}
              className={`${
                isAdminMode 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-brand-red hover:bg-red-700"
              } transition-colors`}
              size="sm"
            >
              {isAdminMode ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Modo Usuario
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Modo Admin
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <PasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </header>
  );
}
