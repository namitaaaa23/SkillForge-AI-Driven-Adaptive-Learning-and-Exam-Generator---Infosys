@echo off
REM SkillForge MySQL Database Setup Script for Windows

setlocal enabledelayedexpansion

echo ================================
echo SkillForge MySQL Setup Script
echo ================================
echo.

REM Configuration
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=skillforge
set DB_USER=skillforge_user
set DB_PASSWORD=skillforge_password
set ROOT_PASSWORD=

echo Configuration:
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo MySQL is not installed or not in PATH.
    echo Please install MySQL and add it to your system PATH.
    pause
    exit /b 1
)

echo Checking MySQL connection...
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% -e "SELECT 1" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Cannot connect to MySQL. Please check your credentials.
    pause
    exit /b 1
)

echo MySQL connection successful
echo.

echo Creating database and user...

REM Create database and user
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% << EOF
CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '%DB_USER%'@'localhost' IDENTIFIED BY '%DB_PASSWORD%';
GRANT ALL PRIVILEGES ON %DB_NAME%.* TO '%DB_USER%'@'localhost';
FLUSH PRIVILEGES;
EOF

if %ERRORLEVEL% NEQ 0 (
    echo Failed to create database and user.
    pause
    exit /b 1
)

echo Database and user created successfully
echo.

echo Importing schema...

REM Import schema
if exist "database\schema.sql" (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < database\schema.sql
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to import schema.
        pause
        exit /b 1
    )
    echo Schema imported successfully
) else (
    echo schema.sql not found in database\ directory
    pause
    exit /b 1
)

echo.
echo Verifying installation...

REM Verify tables
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SHOW TABLES;"

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Update application.properties with database credentials
echo 2. Run: mvn spring-boot:run
echo 3. Access: http://localhost:8080
echo.
pause
