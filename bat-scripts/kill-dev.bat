@echo off
setlocal enabledelayedexpansion

REM Check if running as administrator
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

if '%errorlevel%' NEQ '0' (
    echo Requesting administrator privileges...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B
)

title Mannco.store Enhancer - End Processes
echo === Mannco.store Enhancer - End Processes ===
echo.
echo Looking for development processes...

REM Find processes on port 8081 (HMR server)
set "found_process=0"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
  set "found_process=1"
  echo Found process on port 8081: PID %%p
  echo Terminating process...
  taskkill /F /PID %%p
  if !errorlevel! equ 0 (
    echo Process terminated successfully.
  ) else (
    echo Failed to terminate process.
  )
)

REM Find Node.js processes that might be Turbo
for /f "tokens=2" %%p in ('tasklist /fi "imagename eq node.exe" /fo csv /nh') do (
  set "pid=%%~p"
  for /f "tokens=*" %%c in ('wmic process where "ProcessId=!pid!" get CommandLine /format:list ^| findstr /i /c:"turbo" /c:"dev:" /c:"mannco"') do (
    echo Found potentially related Node.js process: PID !pid!
    echo Terminating process...
    taskkill /F /PID !pid!
    if !errorlevel! equ 0 (
      echo Process terminated successfully.
      set "found_process=1"
    ) else (
      echo Failed to terminate process.
    )
  )
)

if %found_process% equ 0 (
  echo No development processes found.
)

echo.
echo Operation completed. Press any key to exit...
pause >nul
exit /b 0
