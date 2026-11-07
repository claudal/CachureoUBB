import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from './dialog.js';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from './drawer.js';
import { useIsMobile } from '../../hooks/use-mobile.js';

export function ResponsiveModal({ 
  open, 
  onOpenChange, 
  header,
  title, 
  description,
  children,
  footer, 
  closeButton,
  drawerProps = {}, 
  dialogClassName = ""
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} {...drawerProps}>
        <DrawerContent className="max-h-[92vh] flex flex-col">
          {(title || description || header) && (
            <DrawerHeader className="p-4 border-b shrink-0 text-left">
              {title && <DrawerTitle>{title}</DrawerTitle>}
              {description && <DrawerDescription>{description}</DrawerDescription>}
              {header}
            </DrawerHeader>
          )}
          {children}
          {(footer || closeButton) && (
            <DrawerFooter className="shrink-0 p-4 border-t flex flex-col-reverse sm:flex-row gap-2">
              {closeButton && <DrawerClose render={closeButton} />}
              {footer}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 
        Usamos dialogClassName para definir el tamaño. 
        Si no se pasa dialogClassName personalizado, aplica 'sm:max-w-lg' por defecto.
      */}
      <DialogContent className={`flex flex-col p-6 overflow-hidden ${dialogClassName || "sm:max-w-lg"}`}>
        {(header || title || description) && (
          <DialogHeader className="shrink-0 border-b pb-3 text-left">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
            {header}
          </DialogHeader>
        )}
        {children}
        {(footer || closeButton) && (
          <DialogFooter className="shrink-0 pt-3 border-t flex justify-end gap-2">
            {closeButton && <DialogClose render={closeButton} />}
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}