# 2D Tile-Based Level Editor

A prototype level editor for creating 2D tile-based maps. This project combines a modern, reactive UI with a powerful game engine backend to give you a seamless and intuitive world-building experience.

## Overview

The Level Editor is designed to help you craft detailed game worlds with ease. Built with **Solid.js** for the UI and leveraging the robust capabilities of the **Aurora Renderer** (part of Misa engine) for rendering.

Aurora is based on WebGPU to provide best performance.

This editor offers a range of features tailored for game developers and level designers.

The application runs as an Electron app, making it a native experience on Windows. This allows you to benefit from desktop performance and native OS integrations while working on your projects.

## Technology Stack

- **UI Framework**: [Solid.js](https://solidjs.com/)
- **Aurora Renderer**: [Misa Engine (My own tech)](https://game-engine-page.vercel.app/pl/)
- **Desktop Application**: [Electron](https://www.electronjs.org/) for native Windows integration

## Key Features

- **Tile-Based Map Creation**: Easily design game worlds using a grid of tiles. The editor allows for fast and precise level design, enabling you to build intricate maps.
- **Dynamic Object Placement**: Populate your levels with interactive objects such as chests, candles, and NPCs. Each object can be customized and later re-imported into the Misa engine.
- **Cameras & Lighting**: Set up multiple camera views and dynamic lighting to enhance the atmosphere of your scenes. The editor includes support for simulating different lighting conditions and a day-night cycle.
- **Export Options**:
  - **Binary Map Export**: Export your designed maps as binary file. Detailed documentation is provided to guide you through the reading and integration process.
  - **Object Data Export**: Export objects created in the editor so that they can be seamlessly integrated into your game projects with the Misa engine.

## Current State

The project is in a prototype phase, Check out the current state of the application:

- [x] **Create and Load Project**
- [x] **Generating infinite chunks(spiral grid)**
- [x] **Tile layers based on Z-Index**
- [x] **Adding/removing textures**
- [x] **Drawing with texture crop**

![Current State of App on Windows](/public/currentState.png)

## TODO:

- [ ] **User experience features like shortcuts, undo/redo, AABB targeting etc...**
- [ ] **Keyboard inputs**
- [ ] **Minimap module**
- [ ] **Export to binary**
- [ ] **Object Creator**
- [ ] **App Settings**
- [ ] **Rework of Aurora**

## Outro

Feel free to come back later to check out the progress and try the editor! ;)
