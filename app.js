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


// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games

import cors from 'cors';

app.use(cors());

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */

app.get('/',(req,res) => {
  res.json({"message":"Server is Running"})
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
              content: `Bot is Running Successfully ${getRandomEmoji()}`
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'my_button',
                  label: 'Click',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }



    if(name === "github"){

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

    if (name === "canonforces"){

      const response = await fetch(
        'https://api.github.com/repos/OpenLake/canonforces/pulls'
      )

      const pr = await response.json();

      let count = pr.length;

      const fields = pr.slice(0, 5).map((pull) => ({
          name: `📌 ${pull.title}`,
          value:
              `👤 **Author:** ${pull.user.login}\n` +
              `🟢 **State:** ${pull.state}\n` +
              `📅 **Created:** ${pull.created_at.substring(0,10)}\n` +
              `[View Pull Request](${pull.html_url})`
      }));

      return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
              embeds: [
                  {
                      title: "Open Pull Requests",
                      description: `Total Open PRs: ${pr.length}`,
                      fields
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

      // const reporesponse = await fetch(
      //     `https://api.github.com/orgs/${org}/repos?per_page=10`
      // );

      // const repos = await reporesponse.json();

      // const repoList = repos.map(repo => `[${repo.name}](${repo.html_url})`).join("\n");

      // const options = repos.map((repo) => ({
      //     label: repo.name,
      //     value: repo.name,
      //     description: repo.language ?? "No language"
      // }));

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          embeds: [
            {
              title:orgs.login,
              description:orgs.description,
              url:orgs.html_url,

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
              ],
            }]
    }})
    }


    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

            /**
           * Handle requests from interactive components
           */
      if (type === InteractionType.MESSAGE_COMPONENT) {
        // custom_id set in payload when sending message component
        const componentId = data.custom_id;
        // user who clicked button
        const userId = req.body.member.user.id || "User" ;

        if (componentId === 'my_button') {
          console.log(req.body);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `<@${userId}> clicked the button` },
          });
        }
      }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});


// Server is Running on PORT

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
