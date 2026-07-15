# Discord-Github-App

```bash

Overall Sturcture

discord-example-app/
│
├── app.js          ← Main server
├── commands.js     ← Registers slash commands
├── utils.js        ← Discord API helper functions
├── package.json
└── .env
```

```bash
| Value | Meaning                                                                       |
| ----- | ----------------------------------------------------------------------------- |
| `0`   | Guild (Server channels)                                                       |
| `1`   | Bot DM (Direct message with your app/bot, if supported)                       |
| `2`   | Private Channel / User context (places where user-installed apps can be used) |
```

