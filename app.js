import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
// import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};

import cors from 'cors';

app.use(cors());

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */

app.get('/',(req,res) => {
  res.status(400).json({"message":"Server is Running"})
})

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              // Fetches a random emoji to send from a helper function
              content: `hello world ${getRandomEmoji()}`
            }
          ]
        },
      });
    }

    if(name==="github"){

      const username=data.options[0].value;
      const response=await fetch(
      `https://api.github.com/users/${username}`
      );

      const user=await response.json();

      return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
              embeds: [
                  {
                      title: user.login,
                      description: user.bio,
                      url: user.html_url,

                      thumbnail: {
                          url: user.avatar_url
                      },
                      fields: [
                          {
                              name: "Followers",
                              value: `${user.followers}`,
                              inline: true
                          },
                          {
                              name: "Following",
                              value: `${user.following}`,
                              inline: true
                          },
                          {
                              name: "Repositories",
                              value: `${user.public_repos}`,
                              inline: true
                          }
                      ]
                  }
              ]
          }
      });

    }

    if(name === "orgs"){
      const org = data.options[0].value;

      const response = await fetch(
        `https://api.github.com/orgs/${org}`
      )

      const orgs = await response.json();

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          embeds: [
            {
              title:orgs.login,
              description:orgs.description,
              url:orgs.html_url,
              website:orgs.blog,

              thumbnail:{
                url:orgs.avatar_url
              },
              fields: [
                        {
                            name: "Followers",
                            value: `${orgs.followers}`,
                            inline: true
                        },
                        {
                            name: "Following",
                            value: `${orgs.following}`,
                            inline: true
                        },
                        {
                            name: "Repositories",
                            value: `${orgs.public_repos}`,
                            inline: true
                        }
              ]
            }
          ]
        }
      })
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});


// Server is Running on PORT

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
