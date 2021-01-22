#!/bin/bash
set -e

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ $1 ]
then
    docker-compose -f "$dir"/../../docker-compose.ui-only.yaml "$1"
else
    docker-compose -f "$dir"/../../docker-compose.ui-only.yaml up --build
fi
