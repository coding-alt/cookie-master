#!/bin/bash

# 创建打包目录
rm -rf dist
mkdir -p dist/cookie-master

# 复制文件
cp -r src/* dist/cookie-master/

# 添加图标占位符提示
echo "请替换这些占位图标文件" > dist/cookie-master/icons/README.txt

# 创建zip包
cd dist
zip -r cookie-master.zip cookie-master

echo "打包完成，文件位于 dist/cookie-master.zip" 