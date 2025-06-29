@echo off
REM Check if .env doesn't exist and .example.env exists
if not exist ".env" (
  if exist ".example.env" (
    copy /y .example.env .env
    echo .example.env has been copied to .env
  )
)
exit /b 0
