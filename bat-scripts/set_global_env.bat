@echo off
setlocal

REM Change to project root directory (one level above script directory)
cd /d "%~dp0.."

REM Default values
set "CLI_CEB_DEV=false"
set "CLI_CEB_FIREFOX=false"

echo Processing arguments: %*

REM Process arguments individually
for %%i in (%*) do (
    set "param=%%~i"
    echo Processing argument: !param!
    
    REM Remove quotes if present
    set "param=!param:"=!"
    
    REM Split the parameter at the equals sign
    for /f "tokens=1,2 delims==" %%a in ("!param!") do (
        set "key=%%a"
        set "value=%%b"
    )
    
    if not defined value (
        echo Error: No value provided for key !key!
        exit /b 1
    )
    
    echo Key: !key!, Value: !value!
    
    REM Check if key starts with CLI_CEB_
    set "prefix=!key:~0,8!"
    if not "!prefix!"=="CLI_CEB_" (
        echo Invalid key: !key!. All CLI keys must start with 'CLI_CEB_'.
        exit /b 1
    )
    
    REM Handle specific CLI_CEB keys
    if /i "!key!"=="CLI_CEB_DEV" (
        if /i "!value!"=="true" (
            set "CLI_CEB_DEV=true"
        ) else if /i "!value!"=="false" (
            set "CLI_CEB_DEV=false"
        ) else (
            echo Invalid value for CLI_CEB_DEV: !value!
            echo Please use 'true' or 'false'
            exit /b 1
        )
    ) else if /i "!key!"=="CLI_CEB_FIREFOX" (
        if /i "!value!"=="true" (
            set "CLI_CEB_FIREFOX=true"
        ) else if /i "!value!"=="false" (
            set "CLI_CEB_FIREFOX=false"
        ) else (
            echo Invalid value for CLI_CEB_FIREFOX: !value!
            echo Please use 'true' or 'false'
            exit /b 1
        )
    ) else (
        set "!key!=!value!"
    )
)

echo.
echo Final values:
echo CLI_CEB_DEV=!CLI_CEB_DEV!
echo CLI_CEB_FIREFOX=!CLI_CEB_FIREFOX!

REM Create temp file
set "tempfile=%temp%\env_temp.txt"

REM Write to temp file
echo # THOSE VALUES ARE EDITABLE ONLY VIA CLI> "!tempfile!"
echo CLI_CEB_DEV=!CLI_CEB_DEV!>> "!tempfile!"
echo CLI_CEB_FIREFOX=!CLI_CEB_FIREFOX!>> "!tempfile!"

echo.>> "!tempfile!"
echo # THOSE VALUES ARE EDITABLE>> "!tempfile!"

REM Copy CEB_ values from existing .env file
if exist ".env" (
    for /f "usebackq tokens=*" %%a in (".env") do (
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            if "!line:~0,4!"=="CEB_" (
                echo !line!>> "!tempfile!"
            )
        )
    )
)

REM Replace .env file with temp file
copy /y "!tempfile!" ".env" >nul
if %errorlevel% neq 0 (
    echo Error creating .env file
    exit /b 1
)
del "!tempfile!"

echo Environment variables set successfully
exit /b 0
