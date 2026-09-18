@echo off
setlocal

rem Run launch_bloxtip.bat "place-file.rbxl" to send a place to the installed client.
if "%~1"=="" (
  start "" "https://amr010920.github.io/bloxtip/home/"
) else (
  start "" "bloxtip://play?place=%~1"
)

endlocal
