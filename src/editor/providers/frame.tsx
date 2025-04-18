import { JSX } from "solid-js/jsx-runtime";
import { Accessor, createContext, createSignal, Setter } from "solid-js";
interface Props {
  children: JSX.Element;
}
export type FrameButtonTypes = "File" | "Editor" | "Help" | "Project" | "none";
export type FrameModalType = "newProject" | "none" | "openProject" | "closeApp";
interface FrameContextSchema {
  getActiveButton: Accessor<FrameButtonTypes>;
  setActiveButton: Setter<FrameButtonTypes>;
  getActiveModal: Accessor<FrameModalType>;
  setActiveModal: Setter<FrameModalType>;
  isModalOpen: Accessor<boolean>;
  setModalOpen: Setter<boolean>;
}
export const FrameContext = createContext<FrameContextSchema>();

export function FrameProvider(props: Props) {
  const [getActiveButton, setActiveButton] =
    createSignal<FrameButtonTypes>("none");
  const [getActiveModal, setActiveModal] = createSignal<FrameModalType>("none");
  const [isModalOpen, setModalOpen] = createSignal<boolean>(false);

  return (
    <FrameContext.Provider
      value={{
        getActiveButton,
        setActiveButton,
        getActiveModal,
        setActiveModal,
        isModalOpen,
        setModalOpen,
      }}
    >
      {props.children}
    </FrameContext.Provider>
  );
}
