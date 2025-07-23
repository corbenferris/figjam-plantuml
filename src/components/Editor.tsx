import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import * as ace from "ace-builds";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/keybinding-vscode";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/ext-language_tools";

export type EditorProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;

export function Editor({ value, onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ace.Editor>(null);
  const valueRef = useSyncedRef(value);
  const onChangeRef = useSyncedRef(onChange);

  useEffect(() => {
    const aceEditor = ace.edit(containerRef.current, {
      mode: "ace/mode/text",
      theme: "ace/theme/textmate",
      fontSize: "12px",
      newLineMode: "unix",
      showLineNumbers: true,
      showGutter: true,
      wrap: false,
      useWorker: false,
      highlightActiveLine: true,
      highlightGutterLine: true,
      value: valueRef.current,
      enableLiveAutocompletion: true,
    });

    // VSCode Keybinding
    aceEditor.setKeyboardHandler("ace/keyboard/vscode");

    // Make it resize automatically with parent
    aceEditor.resize();

    // Listen for changes
    const handleChange = () => {
      const val = aceEditor.getValue();
      if (val !== value) onChangeRef.current(val);
    };
    aceEditor.on("change", handleChange);
    editorRef.current = aceEditor;

    return () => {
      aceEditor.off("change", handleChange);
      aceEditor.destroy();
      editorRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-0 w-full min-w-0 overflow-auto border border-figma-border"
    />
  );
}

function useSyncedRef<T>(value: T) {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
