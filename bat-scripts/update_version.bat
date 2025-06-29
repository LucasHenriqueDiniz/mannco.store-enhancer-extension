@echo off
setlocal enabledelayedexpansion

REM Check version format (x.x.x)
set "version=%~1"
echo %version%| findstr /r "^[0-9]\+\.[0-9]\+\.[0-9]\+$" >nul
if %errorlevel% neq 0 (
  echo Version format ^<%version%^> isn't correct, proper format is ^<0.0.0^>
  exit /b 1
)

echo Updating versions to %version%...

REM Find all package.json files and update version
for /r %%f in (package.json) do (
  echo %%f | findstr /i "node_modules" >nul
  if !errorlevel! neq 0 (
    set "tmpfile=%temp%\package-temp.json"
    
    (for /f "usebackq delims=" %%l in ("%%f") do (
      set "line=%%l"
      echo !line! | findstr /c:"\"version\":" >nul
      if !errorlevel! equ 0 (
        for /f "tokens=1,2 delims=:" %%a in ("!line!") do (
          echo %%a: "%version%",
        )
      ) else (
        echo !line!
      )
    )) > "!tmpfile!"
    
    copy /y "!tmpfile!" "%%f" >nul
    del "!tmpfile!"
    echo Updated: %%f
  )
)

echo All versions have been updated to %version%
exit /b 0
