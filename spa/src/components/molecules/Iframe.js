import { Plugin } from 'tiptap'
import { updateMark, removeMark, pasteRule } from 'tiptap-commands'
import { Link } from 'tiptap-extensions'
import { getMarkAttrs } from 'tiptap-utils'
import fetchSync from 'sync-fetch';

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
        },
        isTwitter: {
          default: false
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
        if (node.attrs.src || this.options.src) {
          if (node.attrs.isTwitter || this.options.isTwitter) {
            const iframeAttr = this.getIframeCodeFromTweet(node.attrs.src || this.options.src)
            return ['iframe', {
              ...node.attrs,
              ...iframeAttr
            }, 0]
          }
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
        /https?:\/\/(www\.)?twitte[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()!]*)/gi,
        type,
        url => ({ src: url, isTwitter: true }),
      ),
      pasteRule(
        /https?:\/\/(www\.)?youtu[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()!]*)/gi,
        type,
        url => {
          console.log("paste youtube")
          if (url.includes("/embed/")) {
            return { src: url }
          } else if (url.includes("watch?v=")) {
            return { src: "https://youtube.com/embed/" + url.split('watch?v=').pop().split('&')[0] };
          }
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

  getOEmbed(tweetIdOrUrl) {
    const { VUE_APP_API_ENDPOINT } = process.env;
    const endpoint = VUE_APP_API_ENDPOINT + '/twitter-html?url=' + tweetIdOrUrl;
    const response = fetchSync(endpoint)
    return response.json()
  }

  getIframeCodeFromTweet(tweetUrl) {
    console.log("dsnkdsn")
    const { data } = this.getOEmbed(tweetUrl);
    console.log(data);
    let { html, width, height } = data;
    height = height || 650;
    const iframeProps = {
      style: null,
      width,
      height,
      'data-tweet-url': data.url
    };
    // To hide overflow, the style has to be injected *inside* the frame
    html += `<style>html{overflow:hidden !important;}</style>`;
    iframeProps.style = 'border:none;';
    const dataUri = `data:text/html;charset=utf-8,${escape(html)}`;

    return {
      ...iframeProps,
      src: dataUri
    };
  }
}