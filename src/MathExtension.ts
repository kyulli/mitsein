import { Node, mergeAttributes } from "@tiptap/core"
import katex from "katex"
import "katex/dist/katex.min.css"

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,

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
        tag: "div[data-math-block]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-math-block": "",
      }),
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.style.margin = "12px 0"

      try {
        katex.render(node.attrs.latex, dom, {
          throwOnError: false,
          displayMode: true,
        })
      } catch {
        dom.textContent = node.attrs.latex
      }

      return {
        dom,
      }
    }
  },
})
