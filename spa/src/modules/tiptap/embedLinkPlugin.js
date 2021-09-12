/* eslint-disable class-methods-use-this */
import { Plugin } from 'tiptap';
import { updateMark, removeMark, pasteRule } from 'tiptap-commands';
import { Link } from 'tiptap-extensions';
import { getMarkAttrs } from 'tiptap-utils';
import { getSync } from '@/utils/api';

export default class EmbedLinkPlugin extends Link {
  static twitterCache = {}

  get name() {
    return 'link';
  }

  get defaultOptions() {
    return {
      src: null,
    };
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: null,
        },
        height: {
          default: '400px',
        },
        width: {
          default: '80%',
        },
        href: {
          default: null,
        },
        target: {
          default: null,
        },
        isTwitter: {
          default: false,
        },
        isFacebook: {
          default: false,
        },
        isInstagram: {
          default: false,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'iframe',
          getAttrs: dom => ({
            src: dom.getAttribute('src') || dom.getAttribute('href'),
            height: dom.getAttribute('height'),
            width: dom.getAttribute('width'),
          }),
        },
        {
          tag: 'a[href]',
          getAttrs: dom => ({
            href: dom.getAttribute('href'),
            target: dom.getAttribute('target'),
          }),
        },
      ],
      toDOM: (node) => {
        if (node.attrs.src || this.options.src) {
          if (node.attrs.isTwitter || this.options.isTwitter) {
            let content = ['a', {
              ...node.attrs,
              target: node.attrs.target || this.options.target,
            }, 0];

            const iframeAttr = this.getIframeCodeFromTweet(node.attrs.src || this.options.src);
            if (iframeAttr) {
              content = ['iframe', {
                ...node.attrs,
                ...iframeAttr,
              }, 0];
            }

            return content;
          } else if (node.attrs.isFacebook || this.options.isFacebook) {
            const iframeAttr = this.getIframeCodeForFacebook(node.attrs.src || this.options.src);
            return ['iframe', {
              ...node.attrs,
              ...iframeAttr,
            }, 0];
          } else if (node.attrs.isInstagram || this.options.isInstagram) {
            return ['iframe', {
              ...node.attrs,
              width: 320,
              height: 460,
              src: node.attrs.src || this.options.src,
              frameborder: 0,
            }, 0];
          } else {
            return ['iframe', {
              ...node.attrs,
              src: node.attrs.src || this.options.src,
              height: node.attrs.height || this.options.height,
              width: node.attrs.width || this.options.width,
              allowfullscreen: true,
            }, 0];
          }
        } else {
          return ['a', {
            ...node.attrs,
            target: node.attrs.target || this.options.target,
          }, 0];
        }
      },
    };
  }

  commands({ type }) {
    return (attrs) => {
      if (attrs.src) {
        return updateMark(type, attrs);
      }

      return removeMark(type);
    };
  }

  pasteRules({ type }) {
    return [
      pasteRule(
        /https?:\/\/(www\.)?(web\.)?instagram\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()!]*)/gi,
        type,
        (url) => {
          if (!url.includes('/embed')) {
            const newUrl = new URL(url);
            newUrl.pathname = newUrl.pathname.concat(newUrl.pathname.endsWith('/') ? 'embed/' : '/embed/');
            return { src: newUrl.toString(), isInstagram: true };
          }

          return { src: url, isInstagram: true };
        },
      ),
      pasteRule(
        /https?:\/\/(www\.)?twitter\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()!]*)/gi,
        type,
        url => ({ src: url, isTwitter: true }),
      ),
      pasteRule(
        /https?:\/\/(www\.)?(web\.)?facebook\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()!]*)/gi,
        type,
        url => ({ src: url, isFacebook: true }),
      ),
      pasteRule(
        /https?:\/\/(www\.)?youtube\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=,()!]*)/gi,
        type,
        // eslint-disable-next-line consistent-return
        (url) => {
          if (url.includes('/embed/')) {
            return { src: url };
          } else if (url.includes('watch?v=')) {
            return { src: `https://youtube.com/embed/${url.split('watch?v=').pop().split('&')[0]}` };
          }
        },
      ),
    ];
  }

  get plugins() {
    if (!this.options.openOnClick) {
      return [];
    }

    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            const { schema } = view.state;
            const attrs = getMarkAttrs(view.state, schema.marks.link);

            if (attrs.src && event.target instanceof HTMLAnchorElement) {
              event.stopPropagation();
              window.open(attrs.src, attrs.src);
            }
          },
        },
      }),
    ];
  }

  getOEmbed(tweetIdOrUrl) {
    try {
      const response = getSync('API', `/twitter-html?url=${tweetIdOrUrl}`);
      return response.json();
    } catch (e) {
      return null;
    }
  }

  getIframeCodeFromTweet(tweetUrl) {
    if (EmbedLinkPlugin.twitterCache && EmbedLinkPlugin.twitterCache[tweetUrl]) {
      const data = EmbedLinkPlugin.twitterCache[tweetUrl];
      return this.makeTwitterIframe(data);
    } else {
      const oEmbedResponse = this.getOEmbed(tweetUrl);
      if (!oEmbedResponse || !oEmbedResponse.data || !oEmbedResponse.data.html) {
        return null;
      }

      const { data } = oEmbedResponse;
      EmbedLinkPlugin.twitterCache[tweetUrl] = data;
      return this.makeTwitterIframe(data);
    }
  }

  makeTwitterIframe(data) {
    let { html, height } = data;
    const { width } = data;
    height = height || 650;
    const iframeProps = {
      style: null,
      width,
      height,
      'data-tweet-url': data.url,
    };
    // To hide overflow, the style has to be injected *inside* the frame
    html += '<style>html{overflow:hidden !important;}</style>';
    iframeProps.style = 'border:none;';
    const dataUri = `data:text/html;charset=utf-8,${escape(html)}`;

    return {
      ...iframeProps,
      src: dataUri,
    };
  }

  getIframeCodeForFacebook(fbUrl) {
    const html = `<div id="fb-root"></div>
      <script async defer src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2"></script>
      <div class="fb-post"
      data-href="${fbUrl}"
      data-width="500"></div>
  `;
    const dataUri = `data:text/html;charset=utf-8,${escape(html)}`;
    return {
      width: 550,
      src: dataUri,
      frameborder: 0,
    };
  }
}
