APP_NAME = TomatoClock
BUILD_DIR = .build/release
APP_DIR = dist/$(APP_NAME).app
DMG_DIR = dist/dmg
DMG_PATH = dist/$(APP_NAME).dmg

.PHONY: build app dmg package run clean

build:
	swift build -c release

app: build
	rm -rf dist
	mkdir -p "$(APP_DIR)/Contents/MacOS"
	mkdir -p "$(APP_DIR)/Contents/Resources"
	cp "$(BUILD_DIR)/$(APP_NAME)" "$(APP_DIR)/Contents/MacOS/$(APP_NAME)"
	cp Info.plist "$(APP_DIR)/Contents/Info.plist"
	cp Resources/AppIcon.icns "$(APP_DIR)/Contents/Resources/AppIcon.icns"

dmg: app
	rm -rf "$(DMG_DIR)" "$(DMG_PATH)"
	mkdir -p "$(DMG_DIR)"
	cp -R "$(APP_DIR)" "$(DMG_DIR)/$(APP_NAME).app"
	ln -s /Applications "$(DMG_DIR)/Applications"
	hdiutil create -volname "$(APP_NAME)" -srcfolder "$(DMG_DIR)" -ov -format UDZO "$(DMG_PATH)"
	rm -rf "$(DMG_DIR)"

package: dmg

run: app
	open "$(APP_DIR)"

clean:
	rm -rf .build dist
