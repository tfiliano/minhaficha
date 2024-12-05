import { useScrollBehavior } from "@/hooks/use-scroll-behavior";
import {
  forwardRef,
  PropsWithChildren,
  RefObject,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

export type BottomSheetSheetController = RefObject<
  BottomSheetImperativeHandle | undefined
>;

export type BottomSheetImperativeHandle = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: () => boolean;
  setPayload: (payload: any) => void;
  getPayload: () => any;
};

type BottomSheetProps = {
  title: string;
  description: string;
} & PropsWithChildren;

const BottomSheetForward: React.ForwardRefRenderFunction<
  BottomSheetImperativeHandle | undefined,
  BottomSheetProps
> = ({ title, description, children }, ref) => {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      onOpen: () => setOpen(!open),
      onClose: () => setOpen(!open),
      isOpen: () => open,
      setPayload: (payload: any) => setPayload(payload),
      getPayload: () => payload,
    }),
    [open]
  );

  useEffect(() => {
    if (!open && payload) setPayload(null);
  }, [open]);

  useScrollBehavior(open);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="z-50 mb-9">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export const BottomSheet = forwardRef(BottomSheetForward);
