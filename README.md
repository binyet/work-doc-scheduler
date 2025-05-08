# Vue 3 + TypeScript + Vite

`pnpm install`

`pnpm dev`

注:pnpm dev 后，可能会出现`Electron failed to install correctly, please delete node_modules/electron and try installing again`错误，是由于 electron 安装失败导致。可以在[electron](https://github.com/electron/electron/releases/download/v36.1.0/electron-v36.1.0-win32-x64.zip)下载对应版本的 electron，然后解压到 node_modules/electron 目录下,并将其更名为 dist，再手动创建path.txt文件，其内容为```electron.exe```。或使用 npm/cnpm 安装。
