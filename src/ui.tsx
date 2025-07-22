import {
  Button,
  IconHelpSmall24,
  render,
  useWindowResize,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { ComponentChildren, h } from "preact";
import { useState } from "preact/hooks";
import { DEFAULT_VALUE, PlantUML } from "./util/plantuml";
import { useDebouncedCallback } from "./util/debounce";
import { PluginEvent } from "./util/events";
import { Editor } from "./components/Editor";
import "!./output.css";

function onWindowResize(windowSize: { width: number; height: number }) {
  emit(PluginEvent.RESIZE_WINDOW, windowSize);
}

type PluginProps = Readonly<{ text: string }>;

function Plugin({ text: textIn = DEFAULT_VALUE }: PluginProps) {
  const [text, setText] = useState(textIn);
  const [previewURL, setPreviewURL] = useState(() => PlantUML.URL(textIn));

  const updatePreviewURL = useDebouncedCallback((input: string) => {
    setPreviewURL(PlantUML.URL(input));
  }, 500);

  const onInput = (input: string) => {
    setText(input);
    updatePreviewURL(input);
  };

  const onCancel = () => {
    emit(PluginEvent.CANCEL);
  };

  const onSubmit = async () => {
    const url = PlantUML.URL(text);
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      emit(PluginEvent.ERROR, {
        message: `Failed to fetch diagram: ${response.status} ${response.statusText}`,
        stack: error,
      });
      return;
    }

    const src = await response.text();
    emit(PluginEvent.UPDATE_UML, { text, url, src });
  };

  useWindowResize(onWindowResize, {
    minWidth: 120,
    minHeight: 120,
    maxWidth: 4096,
    maxHeight: 2160,
  });

  return (
    <div className="flex h-full flex-col py-4">
      <div className="flex h-full w-full">
        <div className="flex h-full min-h-[200px] w-2/5 min-w-[400px] pl-4">
          <div className="h-full w-full overflow-auto">
            <Editor value={text} onChange={onInput} />
          </div>
        </div>
        <div className="w-full flex-1 px-4">
          <img
            className="inline-block max-h-full max-w-full"
            alt="diagram preview"
            src={previewURL}
          />
        </div>
      </div>

      <div className="flex justify-between border-t border-t-figma-border px-4 pt-4">
        <a
          href="https://plantuml.com"
          rel="noopener noreferrer"
          target="_blank"
          className="flex items-center gap-0.5 hover:underline"
        >
          <IconHelpSmall24 className="cursor-pointer" />
          PlantUML Docs
        </a>
        <div className="flex gap-3">
          <Button secondary onClick={onCancel}>
            Cancel
          </Button>
          <SubmitButton onSubmit={onSubmit}>Update Diagram</SubmitButton>
        </div>
      </div>
    </div>
  );
}

type SubmitButtonProps = Readonly<{
  onSubmit(): Promise<void>;
  children: ComponentChildren;
}>;

function SubmitButton({ onSubmit, children }: SubmitButtonProps) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    try {
      setLoading(true);
      await onSubmit();
    } catch (e) {
      emit(PluginEvent.ERROR, {
        message:
          e instanceof Error ? e.message : `Something went wrong: ${String(e)}`,
        stack: e instanceof Error ? e.stack : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button loading={loading} onClick={onClick}>
      {children}
    </Button>
  );
}

export default render(Plugin);
