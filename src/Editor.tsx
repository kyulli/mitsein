import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { InlineMath } from "./InlineMath"
import { MathBlock } from "./MathExtension"

export default function Editor() {
  const editor = useEditor({
    extensions: [StarterKit, InlineMath, MathBlock],
    content: "<p>hello</p>",

    onUpdate({ editor }) {
      const { state } = editor
      const { doc, selection } = state
      const pos = selection.from

      // 只检查光标前 50 个字符
      const textBefore = doc.textBetween(
        Math.max(0, pos - 50),
        pos,
        "\0",
        "\0"
      )

      // 只在 "$...$ + 空格" 时触发
      const match = textBefore.match(/\$(.+?)\$\s$/)
      if (!match) return

      const latex = match[1]
      const from = pos - match[0].length
      const to = pos

      const tr = state.tr

      // 删除 "$...$ "
      tr.delete(from, to)

      // 插入 latex 文本
      tr.insertText(latex, from)

      // 加 inlineMath mark
      tr.addMark(
        from,
        from + latex.length,
        state.schema.marks.inlineMath.create({ latex })
      )

      editor.view.dispatch(tr)
    },
  })

  if (!editor) return null

  return (
    <div
      style={{
        border: "1px solid red",
        padding: "20px",
        minHeight: "200px",
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
