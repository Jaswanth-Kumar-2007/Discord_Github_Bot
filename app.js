import 'dotenv/config';
import express from 'express';
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import cors from 'cors';
import { getRandomEmoji } from './utils.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Server is Running' });
});

app.post(
  '/interactions',
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async (req, res) => {

    const { type, data } = req.body;

    // Discord verification
    if (type === InteractionType.PING) {
      return res.send({
        type: InteractionResponseType.PONG,
      });
    }

    // -----------------------------
    // Slash Commands
    // -----------------------------
    if (type === InteractionType.APPLICATION_COMMAND) {

      const { name } = data;

      // ---------------- TEST ----------------

      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Hello World ${getRandomEmoji()}`
          }
        });
      }

      // ---------------- GITHUB USER ----------------

      if (name === 'github') {

        const username = data.options[0].value;

        const response = await fetch(
          `https://api.github.com/users/${username}`
        );

        if (!response.ok) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "❌ GitHub user not found."
            }
          });
        }

        const user = await response.json();

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: user.login,
                description: user.bio || "No bio available",
                url: user.html_url,

                thumbnail: {
                  url: user.avatar_url
                },

                fields: [
                  {
                    name: "Followers",
                    value: String(user.followers),
                    inline: true
                  },
                  {
                    name: "Following",
                    value: String(user.following),
                    inline: true
                  },
                  {
                    name: "Repositories",
                    value: String(user.public_repos),
                    inline: true
                  }
                ]
              }
            ]
          }
        });
      }

      // ---------------- ORGANIZATION ----------------

      if (name === "orgs") {

        const org = data.options[0].value;

        const orgResponse = await fetch(
          `https://api.github.com/orgs/${org}`
        );

        if (!orgResponse.ok) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "❌ Organization not found."
            }
          });
        }

        const organization = await orgResponse.json();

        const repoResponse = await fetch(
          `https://api.github.com/orgs/${org}/repos?per_page=100`
        );

        const repos = await repoResponse.json();

        const options = repos
          .slice(0, 25)
          .map(repo => ({
            label: repo.name,
            value: repo.name,
            description: repo.language ?? "No language"
          }));

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {

            embeds: [
              {
                title: organization.login,
                description:
                  organization.description ??
                  "No description",

                url: organization.html_url,

                thumbnail: {
                  url: organization.avatar_url
                },

                fields: [
                  {
                    name: "Followers",
                    value: String(organization.followers),
                    inline: true
                  },
                  {
                    name: "Following",
                    value: String(organization.following),
                    inline: true
                  },
                  {
                    name: "Repositories",
                    value: String(organization.public_repos),
                    inline: true
                  }
                ]
              }
            ],

            components: [
              {
                type: 1,
                components: [
                  {
                    type: 3,
                    custom_id: `repo_select:${org}`,
                    placeholder: "Select Repository",
                    options
                  }
                ]
              }
            ]
          }
        });
      }

      return res.status(400).json({
        error: "Unknown command"
      });
    }

    // -------------------------------------
    // Select Menu Interaction
    // -------------------------------------

    if (type === InteractionType.MESSAGE_COMPONENT) {

      const repo = data.values[0];

      const [, org] = data.custom_id.split(":");

      const response = await fetch(
        `https://api.github.com/repos/${org}/${repo}`
      );

      if (!response.ok) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "❌ Repository not found."
          }
        });
      }

      const repoData = await response.json();

      return res.send({

        // Edit the existing message
        type: InteractionResponseType.UPDATE_MESSAGE,

        data: {

          embeds: [
            {
              title: repoData.full_name,

              description:
                repoData.description ??
                "No description",

              url: repoData.html_url,

              thumbnail: {
                url: repoData.owner.avatar_url
              },

              fields: [
                {
                  name: "⭐ Stars",
                  value: String(repoData.stargazers_count),
                  inline: true
                },
                {
                  name: "🍴 Forks",
                  value: String(repoData.forks_count),
                  inline: true
                },
                {
                  name: "💻 Language",
                  value: repoData.language ?? "None",
                  inline: true
                },
                {
                  name: "🐞 Open Issues",
                  value: String(repoData.open_issues_count),
                  inline: true
                },
                {
                  name: "🌿 Default Branch",
                  value: repoData.default_branch,
                  inline: true
                },
                {
                  name: "📄 License",
                  value: repoData.license?.name ?? "None",
                  inline: true
                }
              ]
            }
          ],

          components: []
        }
      });
    }

    return res.status(400).json({
      error: "Unknown interaction type"
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});