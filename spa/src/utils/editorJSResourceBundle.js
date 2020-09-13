const csMessages = {
  messages: {
    ui: {
      blockTunes: {
        toggler: {
          'Click to tune': 'Nastavit',
          'or drag to move': 'Nebo přesuňte',
        },
      },
      inlineToolbar: {
        converter: {
          'Convert to': 'Převést na',
        },
      },
      toolbar: {
        toolbox: {
          Add: 'Přidat',
        },
      },
    },
    toolNames: {
      Text: 'Text',
      Heading: 'Nadpis',
      List: 'Seznam',
      Quote: 'Citát',
      Delimiter: 'Oddělovač',
      Table: 'Tabulka',
      Image: 'Obrázek',
      Bold: 'Tučně',
      Italic: 'Kurzíva',
      InlineCode: 'Vložený kód',
    },
    tools: {
      warning: {
        Title: 'Nadpis',
        Message: 'Zpráva',
      },
      link: {
        'Add a link': 'Vložte odkaz',
      },
      stub: {
        'The block can not be displayed correctly.': 'Blok nelze zobrazit správně.',
      },
      list: {
        Ordered: 'Číslování',
        Unordered: 'Odrážky',
      },
    },
    blockTunes: {
      delete: {
        Delete: 'Vymazat',
      },
      moveUp: {
        'Move up': 'Posunout nahoru',
      },
      moveDown: {
        'Move down': 'Posunout dolů',
      },
    },
  },
};

const enMessages = {
  messages: {
    ui: {
      blockTunes: {
        toggler: {
          'Click to tune': 'Click to tune',
          'or drag to move': 'or drag to move',
        },
      },
      inlineToolbar: {
        converter: {
          'Convert to': 'Convert to',
        },
      },
      toolbar: {
        toolbox: {
          Add: 'Add',
        },
      },
    },
    toolNames: {
      Text: 'Text',
      Heading: 'Heading',
      List: 'List',
      Quote: 'Quote',
      Delimiter: 'Delimiter',
      Table: 'Table',
      Image: 'Image',
      Bold: 'Bold',
      Italic: 'Italic',
      InlineCode: 'Inline code',
    },
    tools: {
      warning: {
        Title: 'Title',
        Message: 'Message',
      },
      link: {
        'Add a link': 'Add a link',
      },
      stub: {
        'The block can not be displayed correctly.': 'The block can not be displayed correctly.',
      },
      list: {
        Ordered: 'Ordered list',
        Unordered: 'Unordered list',
      },
    },
    blockTunes: {
      delete: {
        Delete: 'Delete',
      },
      moveUp: {
        'Move up': 'Move up',
      },
      moveDown: {
        'Move down': 'Move down',
      },
    },
  },
};

const currentMessages = ((process.env.VUE_APP_I18N_LOCALE || 'cs') === 'cs') ? csMessages : enMessages;
module.exports = currentMessages;
