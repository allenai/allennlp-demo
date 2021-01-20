#!/bin/bash
set -e

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ $1 == "down" ]
then
    docker-compose -f "$dir"/../../docker-compose.ui-only.yaml down
else
    docker-compose -f "$dir"/../../docker-compose.ui-only.yaml up --build
fi
