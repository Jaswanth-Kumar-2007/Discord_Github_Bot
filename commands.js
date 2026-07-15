import 'dotenv/config';
import { capitalize, InstallGuildCommands , InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
// function createCommandChoices() {
//   const choices = getRPSChoices();
//   const commandChoices = [];

//   for (let choice of choices) {
//     commandChoices.push({
//       name: capitalize(choice),
//       value: choice.toLowerCase(),
//     });
//   }

//   return commandChoices;
// }

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command containing options
// const CHALLENGE_COMMAND = {
//   name: 'challenge',
//   description: 'Challenge to a match of rock paper scissors',
//   options: [
//     {
//       type: 3,
//       name: 'object',
//       description: 'Pick your object',
//       required: true,
//       choices: createCommandChoices(),
//     },
//   ],
//   type: 1,
//   integration_types: [0, 1],
//   contexts: [0, 2],
// };

const GITHUB_COMMAND={
  name:"github",
  description:"Search GitHub",
  options:[
    {
      type:3,
      name:"username",
      description:"GitHub username",
      required:true
    }
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const ORG_COMMAND = {
  name:'orgs',
  description:'Search Organisation',
  options:[
    {
      type:3,
      name:"organisation",
      description:"Organisation Name",
      required:true
    }
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const ALL_COMMANDS = [TEST_COMMAND,GITHUB_COMMAND,ORG_COMMAND];

console.log("Registering commands...");
// await InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
// await InstallGuildCommands(
//   process.env.APP_ID,
//   process.env.GUILD_ID,
//   ALL_COMMANDS
// );
console.log("Commands registered successfully!");


