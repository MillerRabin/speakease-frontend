# SpeakEase-Frontend
Speakease-Fronend

---

# Tables of contents
- [Getting started](#getting-started)

---

# Getting started

### Requirments
  - [Node.js](https://nodejs.org/en/download/)
  - [VS Code](https://code.visualstudio.com/download)

### Installation
  - Clone the repository
  ```
  https://github.com/Annyeoungcloud/speakease-frontend.git
  ```
  
  - Install dependencies
  ```
  cd speakease-frontend
  cd ./server && npm install && cd ..
  cd ./static && npm install && cd ..
  ```
  
### Launch static local server
  - VS Code
    - Open the folder in VSCode
    - You need to create a `launch.json` in the `.vscode` folder at `MFL-Fronted` folder
    ```
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "node",
          "request": "launch",
          "name": "Launch Local static server",
          "skipFiles": ["<node_internals>/**"],
          "program": "${workspaceFolder}/server/main.js"
        }
      ]
    }
    ```
    - Start debugging using <kbd>F5</kbd>
  - CLI
    ```
    npm run dev
    ```
    
### Open in chrome browser
  - Open chrome browser with url [http://localhost:9001](http://localhost:9001)    
