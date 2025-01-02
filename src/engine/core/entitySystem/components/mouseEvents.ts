import {
  MOUSE_EVENTS,
  MouseEventMod,
} from "@/engine/core/modules/inputManager/inputManager";
import Component from "../core/component";

type ActionObject = Record<
  (typeof MOUSE_EVENTS)[number],
  ((e: MouseEventMod) => void) | undefined
>;
interface Props extends ActionObject {}
export default class MouseEvents extends Component {
  onEvent: ActionObject;
  constructor(props: Partial<Props>) {
    super();
    this.onEvent = { ...MouseEvents.initialActions(), ...props };
  }
  private static initialActions() {
    return MOUSE_EVENTS.reduce((acc, event) => {
      acc[event] = undefined;
      return acc;
    }, {} as ActionObject);
  }
}
