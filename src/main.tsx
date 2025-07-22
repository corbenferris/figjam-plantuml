/** @jsx figma.widget.h */
const { widget } = figma;
const { AutoLayout, SVG, useSyncedState, usePropertyMenu, useEffect } = widget;
import { on, showUI } from "@create-figma-plugin/utilities";
import { PluginEvent, ErrorEvent } from "./util/events";
import { DEFAULT_SRC, DEFAULT_URL, DEFAULT_VALUE } from "./util/plantuml";

export default function () {
  on(
    PluginEvent.RESIZE_WINDOW,
    function (windowSize: { width: number; height: number }) {
      const { width, height } = windowSize;
      figma.ui.resize(width, height);
    },
  );

  on(PluginEvent.ERROR, function ({ message }: ErrorEvent) {
    figma.notify(message, { error: true });
  });

  on(PluginEvent.CANCEL, function () {
    figma.closePlugin();
  });

  widget.register(PlantUML);
}

type State = {
  text: string;
  src: string;
  url: string;
};

const DEFAULT_STATE: State = {
  text: DEFAULT_VALUE,
  url: DEFAULT_URL,
  src: DEFAULT_SRC,
};

function PlantUML() {
  const [state, setState] = useSyncedState<State>("plantUML", DEFAULT_STATE);

  useEffect(() => {
    return on(PluginEvent.UPDATE_UML, (state: State) => {
      setState(state);
      figma.closePlugin();
    });
  });

  usePropertyMenu(
    [
      {
        itemType: "action",
        tooltip: "Edit",
        propertyName: "edit",
      },
    ],
    ({ propertyName }) => {
      if (propertyName === "edit") {
        // Return unresolved promise to keep the editor UI open
        return new Promise(() => {
          showUI({ height: 768, width: 1366 }, state);
        });
      }
    },
  );

  return (
    <AutoLayout name="PlantUML">
      <SVG
        name="Diagram"
        src={state.src}
        width="fill-parent"
        height="fill-parent"
      />
    </AutoLayout>
  );
}
