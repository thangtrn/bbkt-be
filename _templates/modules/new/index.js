const { toPlural } = require('../../utils/plural');

module.exports = {
  prompt: ({ prompter, args }) => {
    return prompter
      .prompt([
        {
          type: 'input',
          name: 'name',
          message: 'enter module name (kebab-case, e.g. user-profile):',
        },
      ])
      .then((answers) => {
        answers.pluralName = toPlural(answers.name);
        return answers;
      });
  },
};
