@echo off
cd /d C:\Scripts\tps-report
node submit-report.js >> C:\Scripts\tps-report\log.txt 2>&1
