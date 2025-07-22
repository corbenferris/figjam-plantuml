export const PluginEvent = {
  RESIZE_WINDOW: "RESIZE_WINDOW",
  CANCEL: "CANCEL",
  UPDATE_UML: "UPDATE_UML",
  ERROR: "ERROR",
} as const;

export type ErrorEvent = {
  message: string;
  stack?: string;
};
