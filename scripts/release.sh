#!/usr/bin/env bash

set -e # exit with nonzero exit code if anything fails

if [[ $GITHUB_ACTOR == "carbon-bot" ]]; then
  # exit early, since we don't want to try publishing _again_
  exit 0;
fi

# set username and email so git knows who we are
git config user.name "carbon-bot"
git config user.email "carbon@us.ibm.com"

# Add github token to git credentials
git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/credentials 2>/dev/null

# fetch everything to make sure our refs are up to date
git fetch --all

# if we're on the master branch, check if we're up to date, otherwise kill the build
if [[ $GITHUB_REF =~ "master" ]]; then
  currentRef=$(git rev-parse master) # sha of the local branch
  headRef=$(git rev-parse origin/master) # sha of the remote branch
  if [[ $currentRef == $headRef ]]; then
    echo "up to date"
  else
    echo "current branch ahead/behind origin exiting"
    exit 0;
  fi
fi

# if we're on the next branch, check if we're up to date, otherwise kill the build
if [[ $GITHUB_REF =~ "v4-Carbon11" ]]; then
  currentRef=$(git rev-parse v4-Carbon11) # sha of the local branch
  headRef=$(git rev-parse origin/v4-Carbon11) # sha of the remote branch
  if [[ $currentRef == $headRef ]]; then
    echo "up to date"
  else
    echo "current branch ahead/behind origin exiting"
    exit 0;
  fi
fi

# authenticate with the npm registry
npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN -q

if [[ $GITHUB_REF =~ "master" ]]; then
  # graduate the relase with --conventional-graduate
  lerna version --conventional-commits --conventional-graduate --create-release github --yes
  # publish the packages that were just versioned
  lerna publish from-git --dist-tag latest --yes
fi

if [[ $GITHUB_REF =~ "v4-Carbon11" ]]; then
  # version a prerelease to the `next` dist-tag with the `next` preid
  lerna version --conventional-commits --conventional-prerelease --preid v4-Carbon11 --create-release github --yes
  # publish the packages that were just versioned
  lerna publish from-git --dist-tag v4-Carbon11 --yes
fi

# just to be sure we exit cleanly
exit 0;
