@echo off
chcp 65001 >nul
echo =========================================================================================
echo   TIỆN ÍCH TỰ ĐỘNG XUẤT APP: XEM BÓI - NHÂN DUYÊN - TIỀN CĂN - HỆ QUẢ
echo   PHÁT TRIỂN BỞI: TIDU PRODUCTION
echo =========================================================================================
echo.

set "JAVA_HOME=C:\Users\Tidu\.jdks\jbr-21.0.11"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0frontend"

echo [1/4] Dang dong goi giao dien web (Vite build)...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [LOI] Build frontend that bai!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Dang dong bo vao du an Android (Capacitor sync)...
call npx.cmd cap sync android
if %errorlevel% neq 0 (
    echo [LOI] Dong bo Capacitor that bai!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Dang bien dich va ky so ban quyen Tidu Production (Gradle Release)...
cd android
call gradlew.bat assembleRelease bundleRelease
if %errorlevel% neq 0 (
    echo [LOI] Bien dich Gradle that bai!
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Dang copy thanh pham vao thu muc release...
cd /d "%~dp0"
if not exist "release" mkdir "release"

copy /y "frontend\android\app\build\outputs\apk\release\app-release.apk" "release\XemBoi-NhanDuyen-TienCan-HeQua.apk" >nul
copy /y "frontend\android\app\build\outputs\bundle\release\app-release.aab" "release\XemBoi-NhanDuyen-TienCan-HeQua.aab" >nul
copy /y "frontend\android\app\thiencocac.keystore" "release\thiencocac.keystore" >nul
copy /y "release\XemBoi-NhanDuyen-TienCan-HeQua.apk" "release\ThienCoCac.apk" >nul
copy /y "release\XemBoi-NhanDuyen-TienCan-HeQua.aab" "release\ThienCoCac.aab" >nul

echo.
echo =========================================================================================
echo   XUAT THANH CONG! TOAN BO FILE DA DUOC KY SO BAN QUYEN TIDU PRODUCTION!
echo   1. File cai dat tren dien thoai: release\XemBoi-NhanDuyen-TienCan-HeQua.apk
echo   2. File nop Google Play Store:  release\XemBoi-NhanDuyen-TienCan-HeQua.aab
echo   3. File khoa ban quyen:         release\thiencocac.keystore
echo =========================================================================================
echo.
pause
