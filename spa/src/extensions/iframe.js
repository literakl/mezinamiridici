/* eslint-disable class-methods-use-this */
import { Node } from 'tiptap';

export default class Iframe extends Node {
  get name() {
    return 'iframe';
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: null,
        },
      },
      group: 'block',
      selectable: false,
      parseDOM: [{
        tag: 'iframe',
        getAttrs: dom => ({
          src: dom.getAttribute('src'),
        }),
      }],
      toDOM: node => ['iframe', {
        src: node.attrs.src,
        frameborder: 0,
        allowfullscreen: 'true',
      }],
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state;
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos;
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch(transaction);
    };
  }


  get view() {
    return {
      name: 'YoutubeEmbed',
      props: ['node', 'updateAttrs', 'view'],
      computed: {
        src: {
          get() {
            return this.node.attrs.src;
          },
          set(src) {
            this.updateAttrs({
              src,
            });
          },
        },
      },
      render(createElement) {
        if (this.view.editable) {
          return createElement('div', {
            class: 'text-center',
          },
          [
            createElement('iframe', {
              class: 'iframe__embed',
              attrs: {
                ...this.node.attrs,
              },
            }),
            createElement('label', {
              class: 'block',
            },
            [
              createElement('input', {
                class: 'iframe__input',
                domProps: {
                  value: this.src,
                },
                on: {
                  input: (event) => {
                    this.src = event.target.value;
                  },
                  paste: (event) => {
                    event.stopPropagation();
                    this.src = event.target.value;
                  },
                },
              }),
            ]),
          ]);
        } else {
          return createElement('div', [
            createElement('iframe', {
              attrs: {
                ...this.node.attrs,
              },
            }),
          ]);
        }
      },
    };
  }
}
