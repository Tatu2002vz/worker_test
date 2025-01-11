

  

## Installation

  

Step-by-step instructions on how to install and set up the project.

  

1.  **Clone the repository:**

  

2.  **Set up environment variables:** - Create a `env.json` file in the root directory of your project. - Add the required environment variables. For example:

  

````plaintext

{

"PORT": 3005,

"HTTP_PROVIDER": "https://",

"PEAQ_SERVICE_URL": "https://",

"EXPLOER_API": "https://",

"X_API_KEY": "",

"TIME_INTERVAL": 30000,

"SOCKET_URL": "ws://test",

"JWT_TOKEN": "test",

"SOCKET_PATH": "SOCKET_PATH",

"DID_ADDRESS": ""

}

  

```

````

  

3.  **Run The Application**

  
### With Windows:

  

* Install nodejs from: https://nodejs.org/en/download

  

```bash

npm  run  setup

npm  start

```

  

###  With Linux:

  

```bash

sudo  ./install.sh

sudo  ./kaisarWorker

```
# Files Structures
```

📦battle_ship

┣ 📂src

┃ ┣ 📂.data

┃ ┣ 📂enum

┃ ┃ ┗ 📜gpu.js

┃ ┣ 📂util

┃ ┃ ┣ 📜docker.js

┃ ┃ ┣ 📜enum.js

┃ ┃ ┣ 📜socket.js

┃ ┃ ┣ 📜system.js

┃ ┃ ┣ 📜util.js

┃ ┣ 📜index.js

┃ ┣ 📜worker.js

┃ ┗ 📜manageProcess.js

┣ 📜install.sh // File shell script setup for linux

┗ 📜env.json

```