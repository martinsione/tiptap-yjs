import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Document from "@tiptap/extension-document";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createRoot } from "react-dom/client";
import type YProvider from "y-partyserver/provider";
import useYProvider from "y-partyserver/react";

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const COLORS = ["#FFC0CB", "#FFD700", "#98FB98", "#87CEFA", "#FFA07A"];

const MY_COLOR = COLORS[Math.floor(Math.random() * COLORS.length)];

function extensions({ provider }: { provider: YProvider }) {
  return [
    StarterKit.configure({
      // The Collaboration extension comes with its own history handling
      history: false,
    }),
    Document.extend({ content: "heading block*" }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading" && node.children.length === 0) {
          return `Heading ${node.attrs.level}`;
        }

        return "Start typing...";
      },
    }),
    Collaboration.configure({ document: provider.doc }),
    CollaborationCursor.configure({
      provider: provider,
      user: { name: provider.id, color: MY_COLOR },
      /* @see https://github.com/ueberdosis/tiptap/blob/eb4e97d5f279610058fdde4fc2683a0cc553d9e9/packages/extension-collaboration-cursor/src/collaboration-cursor.ts#L108-L122 */
      render: (user) => {
        const cursor = document.createElement("span");

        cursor.classList.add("yjs-caret");
        cursor.setAttribute("style", `border-color: ${user.color}`);

        const label = document.createElement("div");

        label.classList.add("yjs-label");
        label.setAttribute("style", `background-color: ${user.color}`);
        label.insertBefore(document.createTextNode(user.name), null);
        cursor.insertBefore(label, null);

        return cursor;
      },
    }),
  ];
}

export function Editor(props: { roomId: string }) {
  const provider = useYProvider({ party: "document", room: props.roomId });

  const editor = useEditor({
    autofocus: true,
    extensions: extensions({ provider }),
    editorProps: {
      attributes: {
        class: cn(
          "prose mx-auto flex h-full min-h-screen w-full max-w-screen-md flex-col p-1 p-4 outline-none sm:p-8 md:p-20",
          "[&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:h-0 [&_.is-editor-empty]:before:text-neutral-400 [&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
          "[&_.yjs-caret]:pointer-events-none [&_.yjs-caret]:relative [&_.yjs-caret]:mx-[-1px] [&_.yjs-caret]:break-normal [&_.yjs-caret]:border-neutral-900 [&_.yjs-caret]:border-x",
          "[&_.yjs-label]:absolute [&_.yjs-label]:top-[-1.4em] [&_.yjs-label]:left-[-1px] [&_.yjs-label]:select-none [&_.yjs-label]:whitespace-nowrap [&_.yjs-label]:rounded-sm [&_.yjs-label]:p-0.5 [&_.yjs-label]:font-semibold [&_.yjs-label]:text-neutral-900 [&_.yjs-label]:text-xs",
        ),
      },
    },
  });

  return <EditorContent editor={editor} />;
}

function App() {
  const path = document.location.pathname;
  let roomId = path;
  if (path === "/") {
    roomId = crypto.randomUUID();
    document.location.href = roomId;
  }

  return <Editor roomId={roomId} />;
}

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
