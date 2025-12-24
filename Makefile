# Makefile for protosmith

# Variables
PROTO_DIR = transport/proto
STUBS_DIR = transport/stubs
PROTOC_PLUGIN = node_modules/.bin/protoc-gen-ts
SERVICE = CustomerService
DESCRIPTOR = $(STUBS_DIR)/exposed-customer-service.ts
MODULE = customer

# Generate proto stubs
genProto:
	@echo "🔨 Generating protobuf stubs..."
	@mkdir -p $(STUBS_DIR)
	protoc -I=$(PROTO_DIR) \
		--plugin=$(PROTOC_PLUGIN) \
		--ts_opt=optimize_code_size,long_type_number \
		--ts_out=$(STUBS_DIR) \
		$(PROTO_DIR)/*.proto
	@echo "✅ Generated stubs in $(STUBS_DIR)"

# Build TypeScript
build:
	@echo "🔨 Building TypeScript..."
	pnpm build
	@echo "✅ Build complete"

# Clean generated files
clean:
	@echo "🧹 Cleaning generated files..."
	rm -rf dist/
	rm -rf $(STUBS_DIR)/*.ts
	@echo "✅ Clean complete"

# Test service loading
test-service:
	@echo "🧪 Testing service loading..."
	node test-service.js $(DESCRIPTOR) $(SERVICE)

# Generate clean architecture from proto
generate:
	@echo "🚀 Generating clean architecture..."
	pnpm protosmith generate \
		--service $(SERVICE) \
		--descriptor $(DESCRIPTOR) \
		--module $(MODULE) \
		--verbose

# Generate with debug
generate-debug:
	@echo "🔍 Generating with debug output..."
	pnpm protosmith generate \
		--service $(SERVICE) \
		--descriptor $(DESCRIPTOR) \
		--module $(MODULE) \
		--debug

# Interactive generation
generate-interactive:
	@echo "💬 Interactive generation..."
	pnpm protosmith generate --interactive --verbose

# Full workflow
all: clean genProto build generate
	@echo "✅ All done!"

# Help
help:
	@echo "Available commands:"
	@echo "  make genProto            - Generate protobuf stubs from .proto files"
	@echo "  make build               - Build TypeScript code"
	@echo "  make clean               - Clean generated files"
	@echo "  make test-service        - Test service loading"
	@echo "  make generate            - Generate clean architecture"
	@echo "  make generate-debug      - Generate with debug output"
	@echo "  make generate-interactive - Interactive generation mode"
	@echo "  make all                 - Full workflow (clean, proto, build, generate)"
	@echo ""
	@echo "Variables (can override):"
	@echo "  SERVICE=$(SERVICE)"
	@echo "  DESCRIPTOR=$(DESCRIPTOR)"
	@echo "  MODULE=$(MODULE)"

.PHONY: genProto build clean test-service generate generate-debug generate-interactive all help
