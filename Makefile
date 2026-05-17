APP_NAME = TomatoClock
BUILD_DIR = .build/release
APP_DIR = dist/$(APP_NAME).app

.PHONY: build app run clean

build:
	swift build -c release

app: build
	rm -rf dist
	mkdir -p "$(APP_DIR)/Contents/MacOS"
	cp "$(BUILD_DIR)/$(APP_NAME)" "$(APP_DIR)/Contents/MacOS/$(APP_NAME)"
	cp Info.plist "$(APP_DIR)/Contents/Info.plist"

run: app
	open "$(APP_DIR)"

clean:
	rm -rf .build dist
