@echo off
REM Create scheduled task: runs Mon-Sat at 11:00 AM
REM Must run this script as Administrator

schtasks /create ^
  /tn "TPS Traffic Report" ^
  /tr "C:\Scripts\tps-report\run.bat" ^
  /sc weekly ^
  /d MON,TUE,WED,THU,FRI,SAT ^
  /st 11:00 ^
  /f

echo.
echo Task "TPS Traffic Report" created successfully.
echo Schedule: Mon-Sat at 11:00 AM
echo Log file: C:\Scripts\tps-report\log.txt
pause
