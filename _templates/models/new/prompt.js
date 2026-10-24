module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'model name (kebab-case, e.g. user-profile):',
  },
  {
    type: 'select',
    name: 'prefix',
    message: 'table prefix (bs=business, dt=data):',
    choices: [
      { name: 'bs', value: 'bs' },
      { name: 'dt', value: 'dt' },
      { name: 'other (type your own)', value: 'other' },
    ],
    async result(value) {
      if (value !== 'other') return value;

      const custom = await this.enquirer.prompt({
        type: 'input',
        name: 'customPrefix',
        message: 'enter custom prefix:',
      });

      return custom.customPrefix;
    },
  },
];
