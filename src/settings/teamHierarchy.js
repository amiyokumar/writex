/*
 * Desc     :   Role hierarchy
 * Created  :   25/07/2023
 * Author   :   Nawed Anjum
 **/

module.exports = {
  pm: {
    Accounts: ['accounts'],
    Sales: ['sales'],
    Dev: ['tm'],
    Quality: ['tm'],
  },
  tm: {
    Quality: ['qa'],
    Dev: ['tl'],
  },
  tl: { Dev: ['dev'] },
  admin: { Accounts: ['accounts'], Sales: ['sales'], Dev: ['tm', 'tl', 'dev'], Quality: ['tm', 'qa'] },
  user: {},
  sales: { Sales: ['pm'] },
  accounts: {},
  dev: {},
  qa: {},
};
