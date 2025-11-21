# 🚀 MicroLend - Complete Startup Guide

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  MicroLend DApp Startup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you start all components of the MicroLend DApp" -ForegroundColor Yellow
Write-Host ""

Write-Host "You need to run these in SEPARATE terminals:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Terminal 1 - Hardhat Local Blockchain:" -ForegroundColor Cyan
Write-Host "  cd contracts" -ForegroundColor White
Write-Host "  npx hardhat node" -ForegroundColor Green
Write-Host ""

Write-Host "Terminal 2 - Deploy Smart Contract:" -ForegroundColor Cyan
Write-Host "  cd contracts" -ForegroundColor White
Write-Host "  npx hardhat ignition deploy ignition/modules/MicroLending.js --network localhost" -ForegroundColor Green
Write-Host ""

Write-Host "Terminal 3 - Backend Server:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  python app.py" -ForegroundColor Green
Write-Host ""

Write-Host "Terminal 4 - Frontend Development Server:" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Green
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "After all servers are running:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "  2. Sign up or login" -ForegroundColor White
Write-Host "  3. Connect MetaMask wallet" -ForegroundColor White
Write-Host "  4. Start lending or borrowing!" -ForegroundColor White
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Would you like to:" -ForegroundColor Yellow
Write-Host "  [1] Start Hardhat Node" -ForegroundColor White
Write-Host "  [2] Start Backend Server" -ForegroundColor White
Write-Host "  [3] Start Frontend Server" -ForegroundColor White
Write-Host "  [4] View Integration Guide" -ForegroundColor White
Write-Host "  [5] Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "Starting Hardhat Node..." -ForegroundColor Green
        Set-Location contracts
        npx hardhat node
    }
    "2" {
        Write-Host "Starting Backend Server..." -ForegroundColor Green
        Set-Location backend
        python app.py
    }
    "3" {
        Write-Host "Starting Frontend Server..." -ForegroundColor Green
        Set-Location frontend
        npm run dev
    }
    "4" {
        Write-Host "Opening Integration Guide..." -ForegroundColor Green
        code INTEGRATION_COMPLETE.md
    }
    "5" {
        Write-Host "Goodbye!" -ForegroundColor Green
        exit
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}
