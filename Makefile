APP_NAME = TomatoClock
BUILD_DIR = .build/release
APP_DIR = dist/$(APP_NAME).app
DMG_DIR = dist/dmg
DMG_PATH = dist/$(APP_NAME).dmg
IOS_PROJECT_DIR = iOS
IOS_PROJECT = $(IOS_PROJECT_DIR)/TomatoClockIOS.xcodeproj
IOS_SCHEME = TomatoClockIOS
IOS_ARCHIVE = dist/ios/TomatoClockIOS.xcarchive
IOS_IPA_DIR = dist/ios/ipa
IOS_UNSIGNED_IPA = dist/ios/TomatoClockIOS-unsigned.ipa

.PHONY: build app dmg package run ios-project ios-unsigned-ipa clean

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

ios-project:
	cd "$(IOS_PROJECT_DIR)" && xcodegen generate

ios-unsigned-ipa: ios-project
	rm -rf dist/ios
	xcodebuild \
		-project "$(IOS_PROJECT)" \
		-scheme "$(IOS_SCHEME)" \
		-configuration Release \
		-sdk iphoneos \
		-destination 'generic/platform=iOS' \
		-derivedDataPath dist/ios/DerivedData \
		CODE_SIGNING_ALLOWED=NO \
		build
	rm -rf "$(IOS_IPA_DIR)"
	mkdir -p "$(IOS_IPA_DIR)/Payload"
	cp -R "dist/ios/DerivedData/Build/Products/Release-iphoneos/$(IOS_SCHEME).app" "$(IOS_IPA_DIR)/Payload/"
	cd "$(IOS_IPA_DIR)" && zip -qry "../$(notdir $(IOS_UNSIGNED_IPA))" Payload

run: app
	open "$(APP_DIR)"

clean:
	rm -rf .build dist
