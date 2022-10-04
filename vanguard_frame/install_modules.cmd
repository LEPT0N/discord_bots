@echo off
setlocal

echo.
echo Installing modules from %~dp0
echo.

pushd %~dp0

npm install

popd
