#!/bin/sh

# Set bash behaviour
set -eux

# Configure sonar version
SONAR_SCANNER_VERSION=4.2.0.1873

# Install dependencies
apk add --no-cache \
  ca-certificates \
  curl \
  unzip \
  libc6-compat \
  openjdk11-jre

# Download sonar scanner
mkdir -p /opt
curl -fSL https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux.zip \
  -o /opt/sonar-scanner.zip

# Unzip file and remove zip
unzip -qq /opt/sonar-scanner.zip -d /opt
mv /opt/sonar-scanner-${SONAR_SCANNER_VERSION}-linux /sonar-scanner
rm /opt/sonar-scanner.zip

# Set symlink
ln -s /sonar-scanner/bin/sonar-scanner /bin/sonar-scanner

# [WORKAROUND] Configure sonar-scanner to use system jre
sed -i 's/use_embedded_jre=true/use_embedded_jre=false/g' /sonar-scanner/bin/sonar-scanner

