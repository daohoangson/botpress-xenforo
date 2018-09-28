#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"
_dockerPath="$( pwd )"
_srcPath="$( dirname "$_dockerPath" )"

_dataPath="$_dockerPath/.data"
if [ ! -d "$_dataPath" ]; then
  mkdir "$_dataPath"
fi

_netrcPath="$_dataPath/netrc"
if [ ! -f "$_netrcPath" ]; then
  touch "$_netrcPath"
fi

_nodeLts='8.12.0'

docker run --name bpxf --rm -it \
  -p "13000:3000" \
  -v "$_srcPath:/src" \
  -v "$_dataPath/yarn:/usr/local/share/.config/yarn" \
  -v "$_netrcPath:/root/.netrc" \
  -w "/src" \
  "node:${_nodeLts}-alpine" sh
