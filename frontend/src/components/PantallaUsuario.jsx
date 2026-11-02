import { NavLink, Outlet } from "react-router-dom";
import { Badge } from "./ui/badge";

export default function PantallaUsuario({ menuItems, onClick }) {
  return (
    <div className="h-screen">
      <main className="h-full overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="
        fixed
        bottom-0
        left-0
        right-0
        h-21
        border-t
        bg-background
      ">
        <div className="flex h-full">
          {menuItems.map((item) => (
            <NavLink
              onClick={() => onClick?.(item.nombre)}
              key={item.nombre}
              to={item.nombre}
              end
              className={({ isActive }) =>
                `
                flex-1
                flex
                flex-col
                justify-center
                items-center
                gap-1
                h-full
                ${isActive ? "text-primary bg-primary-foreground" : "text-muted-foreground"}
                `
              }
            >
              {<item.icono size={20} />}
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