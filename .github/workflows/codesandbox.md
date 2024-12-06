name: codesandbox

on: [push, pull_request]

jobs:
test-codesandbox:
name: Test Codesandbox
runs-on: ubuntu-latest
container:
image: cypress/browsers:node16.14.0-slim-chrome99-ff97
options: --privileged

    steps:
      - name: Upgrade git
        run: |
          echo deb "http://archive.debian.org/debian buster-backports main" >> /etc/apt/sources.list
          apt-get update
          apt-get install -y git/buster-backports

      - name: Checkout code
        uses: actions/checkout@v4

      - uses: dorny/paths-filter3
        id: changes
        with:
          filters: |
            react:
              - 'packages/react/**'

      - name: Increase watchers
        run: echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && sysctl -p

      - name: Use Node.js
        uses: actions/setup-node@v4
        if: steps.changes.outputs.react == 'true'
        with:
          node-version: '20.x'

      - name: Cache dependencies
        uses: actions/cache@v4
        if: steps.changes.outputs.react == 'true'
        with:
          path: |
            node_modules
            */*/node_modules
          key: ${{ runner.os }}-${{ hashFiles('**/yarn.lock') }}

      - name: Cache Cypress binary
        uses: actions/cache@v4
        if: steps.changes.outputs.react == 'true'
        with:
          path: ~/.cache/Cypress
          key: cypress-${{ runner.os }}-cypress-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            cypress-${{ runner.os }}-cypress-

      - name: Install dependencies
        if: steps.changes.outputs.react == 'true'
        run: |
          yarn --frozen-lockfile
          yarn lerna run --stream postinstall
          yarn lerna link

      - name: Test CodeSandbox
        if: steps.changes.outputs.react == 'true'
        run: |
          cd packages/react
          yarn test:sandbox
