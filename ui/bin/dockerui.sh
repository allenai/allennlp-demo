#!/bin/bash

if [ $1 == "down" ]
then
    docker-compose -f ../docker-compose.ui-only.yaml down
else
    docker-compose -f ../docker-compose.ui-only.yaml up --build
fi
