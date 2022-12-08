#!/bin/bash

TARGET="${TARGET:-./distribution}" 

rm -rf "${TARGET}/packs" || die "Removing old assets in priv/static/packs failed"
cp -r public/packs "${TARGET}/packs" || die "Copying new assets in priv/static/packs failed"
rm -rf "${TARGET}/emoji/*.svg" || die "Removing the old emoji assets failed"
cp -r public/emoji/* "${TARGET}/emoji" || die "Installing the new emoji assets failed"
