#!/bin/bash
cd /Users/apple/Desktop/work/CSM/mikipedia
pkill -f "expo start" 2>/dev/null
sleep 1
npx expo start --ios
