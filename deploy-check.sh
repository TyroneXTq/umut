#!/bin/bash

# Render Deployment Helper Script
# Bu script yerel testleri çalıştırır ve deployment'a hazırlamaya yardımcı olur

echo "🚀 Render Deployment Helper"
echo "=========================="
echo ""

# 1. Node modules check
echo "1️⃣  Node modules kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules bulunamadı, yükleniyor..."
    npm install
else
    echo "   ✅ node_modules mevcut"
fi

echo ""
echo "2️⃣  Temel kontroller yapılıyor..."

# Check for required files
files=("app.js" "package.json" ".gitignore" ".env.example" "render.yaml")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file mevcut"
    else
        echo "   ❌ $file EKSIK!"
    fi
done

echo ""
echo "3️⃣  Git status kontrol ediliyor..."
git status

echo ""
echo "4️⃣  Deployment adımları:"
echo "   📝 1. data.db gitignore'da olduğundan emin ol"
echo "   📝 2. .env dosyası CREATE ETME (sadece .env.example)"
echo "   📝 3. ADMIN_KEY güçlü bir şey olsun"
echo "   📝 4. git push yap"
echo "   📝 5. Render dashboard'da settings güncelle"
echo ""

# Check git ignore
if grep -q "^data.db" .gitignore; then
    echo "   ✅ data.db gitignore'da"
else
    echo "   ⚠️  data.db gitignore'da değil!"
fi

if [ -f ".env" ]; then
    echo "   ⚠️  .env dosyası var! Render'a gitmemeli, .gitignore kontrol et"
else
    echo "   ✅ .env dosyası yok (doğru)"
fi

echo ""
echo "5️⃣  Deployment hazırlığı:"
echo "   Çalıştır:"
echo "   $ git add ."
echo "   $ git commit -m \"Render deployment ready\""
echo "   $ git push origin main"
echo ""
