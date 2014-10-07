#!/bin/bash

#All of the vfollowing environment variables need to be updated before the software can be used.

# Generate an app key on dev.twitter.com
export APPTOKEN="123123123"
export APPSECRE="bacabcabc"

# Generate a user token in the app you created above on dev.twitter.com
export USRTOKEN="123123123"
export USRSECRE="bacabcabc"

export TRACK="twitter"

node twitter.js