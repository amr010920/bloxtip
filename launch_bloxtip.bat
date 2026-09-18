@echo off
setlocal

rem Usage:
rem   launch_bloxtip.bat "C:\path\to\place-file.rbxl"
rem   launch_bloxtip.bat

if "%~1"=="" (
  start "" "https://amr010920.github.io/bloxtip/home/"
  exit /b
)

set "place=%~1"
start "" "bloxtip://play?place=%place%"

endlocal
