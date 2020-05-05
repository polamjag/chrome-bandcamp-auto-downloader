.DEFAULT_GOAL: build
.PHONY: build

build:
	zip -r out-`date '+%Y%m%d-%H%M%S'`.zip src/
