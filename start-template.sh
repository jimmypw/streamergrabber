#!/bin/bash

#All of the vfollowing environment variables need to be updated before the software can be used.

# Generate an app key on dev.twitter.com
export APPTOKEN="123123123"
export APPSECRE="bacabcabc"

# Generate a user token in the app you created above on dev.twitter.com
export USRTOKEN="123123123"
export USRSECRE="bacabcabc"

export DEFCOLOR="0;32m"
export HGHCOLOR="0;34;1;43m"
export TWTCOLOR="0;36m"

export DEBUG="false"
export TRACK="twitter"

node twitter.js