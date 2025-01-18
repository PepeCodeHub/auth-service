#!/bin/sh

# Check if the auth-service process is running
if pgrep -x "auth-service" > /dev/null
then
  exit 0
else
  exit 1
fi