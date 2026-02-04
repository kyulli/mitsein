import { Mark } from "@tiptap/core"

export const InlineMath = Mark.create({
  name: "inlineMath",

  inclusive: false,

  addAttributes() {
    return {
      latex: {
        default: "",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "span[data-inline-math]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "data-inline-math": "",
        style: "background-color: #eef; padding: 2px 4px;",
        ...HTMLAttributes,
      },
      0,
    ]
  },
})
