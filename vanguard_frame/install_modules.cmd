@echo off
setlocal

echo.
echo Installing modules from %~dp0
echo.

pushd %~dp0

npm install discord.io winston -save .

npm install https://github.com/woor/discord.io/tarball/gateway_v6

npm install node-fetch

npm install fs

npm install http

npm install -g node-gyp

npm install http-request

popd
