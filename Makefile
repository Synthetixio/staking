dev:
	@NODE_OPTIONS=--max_old_space_size=4096 npm run dev

deploy:
	@npm run build
	@surge -d https://borrow-synths.surge.sh -p build

.PHONY: dev deploy