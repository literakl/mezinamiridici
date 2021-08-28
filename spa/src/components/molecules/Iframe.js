import { Mark, Node, Plugin } from 'tiptap'
import { updateMark, removeMark, pasteRule } from 'tiptap-commands'
import { Link } from 'tiptap-extensions'
import { getMarkAttrs } from 'tiptap-utils'

export default class Iframe extends Link {

  get name() {
    return 'link'
  }

  get defaultOptions() {
    return {
      src: null
    }
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: null,
        },
        height: {
          default: "400px",
        },
        width: {
          default: "80%",
        },
        href: {
          default: null
        },
        target: {
          default: null
        }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'iframe',
          getAttrs: dom => {
            return {
              src: dom.getAttribute('src') || dom.getAttribute('href'),
              height: dom.getAttribute('height'),
              width: dom.getAttribute('width')
            }
          },
        },
        {
          tag: 'a[href]',
          getAttrs: dom => ({
            href: dom.getAttribute('href'),
            target: dom.getAttribute('target')
          })
        }
      ],
      toDOM: node => {
        debugger
        if (node.attrs.src || this.options.src) {
          return ['iframe', {
            ...node.attrs,
            src: node.attrs.src || this.options.src,
            height: node.attrs.height || this.options.height,
            width: node.attrs.width || this.options.width,
            allowfullscreen: true
          }, 0]
        } else {
          return ['a', {
            ...node.attrs,
            target: node.attrs.target || this.options.target,
          }, 0]
        }

      },
    }
  }

  commands({ type }) {
    return attrs => {
      if (attrs.src) {
        return updateMark(type, attrs)
      }

      return removeMark(type)
    }
  }

  pasteRules({ type }) {
    return [
      pasteRule(
        /https?:\/\/(www\.)?youtu[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()!]*)/gi,
        type,
        url => {
          if (url.includes("/embed/")) {
            return { src: url }
          } else if (url.includes("watch?v=")) {
            return { src: "https://youtube.com/embed/" + url.split('watch?v=').pop().split('&')[0] };
          }
          return { src: url }
        },
      ),
    ]
  }

  get plugins() {
    if (!this.options.openOnClick) {
      return []
    }

    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            const { schema } = view.state
            const attrs = getMarkAttrs(view.state, schema.marks.link)

            if (attrs.src && event.target instanceof HTMLAnchorElement) {
              event.stopPropagation()
              window.open(attrs.src, attrs.src)
            }
          },
        },
      }),
    ]
  }

}