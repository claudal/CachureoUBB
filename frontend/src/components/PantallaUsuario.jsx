import { NavLink, Outlet } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Toaster } from "./ui/toast";

export default function PantallaUsuario({ menuItems, onClick, contextData=null }) {
  return (
    <div className="h-screen flex flex-col">
      {/* 
        Ajustamos pb-20 (80px) para dejar espacio exacto a la barra inferior 
        y evitar que tape el contenido en scroll 
      */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet context={contextData}/>
      </main>
      
      <Toaster />

      <nav className="
        fixed
        bottom-0
        left-0
        right-0
        h-20
        border-t
        bg-background
        z-50
      ">
        <div className="flex h-full">
          {menuItems.map((item) => (
            <NavLink
              onClick={() => onClick?.(item.nombre)}
              key={item.nombre}
              to={item.nombre}
              end
              className={({ isActive }) => `
                flex-1
                flex
                flex-col
                justify-center
                items-center
                gap-1
                h-full
                ${isActive ? "text-primary bg-primary-foreground" : "text-muted-foreground"}
              `}
            >
              <item.icono size={20} />
              <span className="text-xs">
                {item.texto}
              </span>
              {item.notificacion && <Badge variant="default">Nuevo</Badge>}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}