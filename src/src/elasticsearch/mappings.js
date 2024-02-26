module.exports = {
  properties: {
    type: {
      type: 'keyword',
    },
    uid: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    subject: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    issue: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    dateFormatted: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    comments: {
      properties: {
        comment: {
          type: 'text',
          analyzer: 'leadahead',
          search_analyzer: 'standard',
        },
        owner: {
          properties: {
            email: {
              type: 'text',
              analyzer: 'email',
            },
          },
        },
      },
    },
    notes: {
      properties: {
        note: {
          type: 'text',
          analyzer: 'leadahead',
          search_analyzer: 'standard',
        },
        owner: {
          properties: {
            email: {
              type: 'text',
              analyzer: 'email',
            },
          },
        },
      },
    },
    owner: {
      properties: {
        email: {
          type: 'text',
          analyzer: 'email',
        },
      },
    },
    universityName: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    ticketID: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    module: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    workCategory: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
    invoiceNumber: {
      type: 'text',
      analyzer: 'leadahead',
      search_analyzer: 'standard',
    },
  },
};
