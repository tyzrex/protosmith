# 🔨 Protosmith

A powerful CLI tool for generating TypeScript clean architecture layers from protobuf service definitions. Streamline your gRPC development workflow by automatically generating contracts, repositories, services, and transport layers with intelligent import resolution.

## ✨ Features

- 🔄 **Automatic Code Generation** - Generates TypeScript code from compiled protobuf-ts services
- 🏗️ **Flexible Architecture** - Supports both clean architecture and modular project structures
- 📦 **Smart Import Resolution** - Automatically handles cross-proto imports (e.g., common.proto, shared types)
- 🎯 **Multiple Layers** - Generates contracts, repositories, services, and transport layers
- 🔍 **Type Source Tracking** - Intelligently maps types to their original source files
- 💬 **Interactive Mode** - User-friendly prompts for easy configuration
- 🎨 **Formatted Output** - Generates clean, formatted code with Prettier

## 📋 Prerequisites

- Node.js >= 18
- TypeScript >= 5.0
- Compiled protobuf files using [protobuf-ts](https://github.com/timostamm/protobuf-ts)

## 📦 Installation & Setup

### Local Development Setup

Currently, Protosmith is available for local development. Follow these steps:

```bash
# Clone the repository
git clone https://github.com/yourusername/protosmith.git
cd protosmith

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Running Locally

You can run Protosmith locally using one of these methods:

**Method 1: Using tsx (Development)**
```bash
tsx cli.ts generate --interactive
```

**Method 2: Using pnpm script**
```bash
pnpm protosmith generate --interactive
```

**Method 3: Create a symlink (Recommended for frequent use)**
```bash
# From the protosmith directory
npm link

# Now you can use it anywhere
protosmith generate --interactive
```

# From the protosmith directory
tsx cli.ts generate --interactive

# Or if you've run npm link
protosmith generate --interactive
```

The CLI will guide you through:
- Selecting your service descriptor file
- Choosing output directory
- Configuring service and module names
- Selecting architecture structure
- Choosing which layers to generate

#### Non-Interactive Mode

```bash
# From the protosmith directory
tsx cli.ts generate \
  --service UserService \
  --descriptor ./src/stubs/user-service.ts \
  --module user \
  --structure clean \
  --layers transport,contract,repository,service

# Or if you've run npm link

### 2. Generate Code

#### Interactive Mode (Recommended for first-time users)

```bash
protosmith generate --interactive
```

The CLI will guide you through:
- Selecting your service descriptor file
- Choosing output directory
- Configuring service and module names
- Selecting architecture structure
- Choosing which layers to generate

#### Non-Interactive Mode

```bash
protosmith generate \
  --service UserService \
  --descriptor ./src/stubs/user-service.ts \
  --module user \
  --structure clean \
  --layers transport,contract,repository,service
```

## 📖 Usage Examples

### Example 1: Basic Service Generation

**Proto Definition:**
```proto
// user.proto
syntax = "proto3";

package user.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
}

message GetUserRequest {
  string user_id = 1;
}

tsx cli.tstUserResponse {
  User user = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

**Generate Command:**
```bash
protosmith generate \
  --service UserService \
  --descriptor ./stubs/user-service.ts \
  --module user \
  --layers transport,contract,repository
```

**Generated Contract (contract):**
```typescript
import type {
    CreateUserRequest,
    CreateUserResponse,
    GetUserRequest,
    GetUserResponse,
} from '@transport/gateway/gRPC/stubs/user-service';

export interface UserServiceRepository {
    getUser(input: GetUserRequest): Promise<GetUserResponse>;
    createUser(input: CreateUserRequest): Promise<CreateUserResponse>;
}
```

**Generated Repository:**
```typescript
import { UserServiceRepository } from '@domain/user/user.contract';
import { userGrpcRequests } from '@transport/gateway/gRPC/requests/user.requests';
import type {
    CreateUserRequest,
    CreateUserResponse,
    GetUserRequest,
    GetUserResponse,
} from '@transport/gateway/gRPC/stubs/user-service';

export class UserServiceGrpcRepository implements UserServiceRepository {
    async getUser(input: GetUserRequest): Promise<GetUserResponse> {
        return userGrpcRequests.getUser(input);
    }

    async createUser(input: CreateUserRequest): Promise<CreateUserResponse> {
        return userGrpcRequests.createUser(input);
    }
}
```

### Example 2: Cross-Proto Imports

**Proto Definitions:**
```proto
// common.proto
syntax = "proto3";

package common;

message Address {
  string street = 1;
  string city = 2;
  string country = 3;
}

message Profile {
  string id = 1;
  string name = 2;
  Address address = 3;
}
```

```proto
// user.proto
syntax = "proto3";

package user.v1;

import "common.proto";

service UserService {
  rpc GetUserProfile(GetProfileRequest) returns (common.Profile);
}

message GetProfileRequest {
  string user_id = 1;
}
```

**Generated Code with Smart Imports:**
```typescript
// ✅ Protosmith correctly identifies that Profile comes from common.proto
tsx cli.tse { GetProfileRequest } from '@transport/gateway/gRPC/stubs/user-service';
import type { Profile } from '@transport/gateway/gRPC/stubs/common';

export interface UserServiceRepository {
    getUserProfile(input: GetProfileRequest): Promise<Profile>;
}
```

### Example 3: Module Structure

Generate with modular architecture:

```bash
protosmith generate \
  --service ProfileService \
  --descriptor ./stubs/profile-service.ts \
  --module profile \
  --structure modules \
  --layers transport,contract,repository
```

**Output Structure:**
```
src/
└── modules/
    └── profile/
tsx cli.ts─ requests/
        │   └── profile.requests.ts      # Transport layer
        ├── contracts/
        │   └── profile.contract.ts      # Contract interfaces
        └── repos/
            └── profile.repo.ts          # Repository implementation
```

### Example 4: Clean Architecture Structure

Generate with clean architecture (default):

```bash
protosmith generate \
  --service CustomerService \
  --descriptor ./stubs/customer-service.ts \
  --module customer \
  --structure clean
```

**Output Structure:**
```
src/
├── transport/
│   └── gateway/
│       └── gRPC/
│           └── requests/
│               └── customer.requests.ts
├── domain/
│   └── customer/
│       └── customer.contract.ts
├── repository/
│   └── customer/
│       └── customer.grpc.repo.ts
└── service/
    └── customer/
        └── customer.service.ts
```

## 🔧 CLI Options

### `generate` Command

| Option | Description | Default |
|--------|-------------|---------|
| `--interactive` | Enable interactive mode with prompts | `false` |
| `--service <name>` | Service name from proto file | Required |
| `--descriptor <path>` | Path to compiled proto TypeScript file | Required |
| `--module <name>` | Module name for generated files | Required |
| `--out <path>` | Output root directory | `src` |
| `--structure <type>` | Architecture structure: `clean` or `modules` | `clean` |
| `--layers <layers>` | Comma-separated layers to generate | All layers |
| `--verbose` | Enable verbose logging | `false` |
| `--debug` | Enable debug logging | `false` |

### Available Layers

- **transport** - gRPC request handlers and client interactions
- **contract** - TypeScript interfaces defining repository contracts
- **repository** - Repository implementations connecting to gRPC
- **service** - Business logic service layer

## 🎯 Architecture Patterns

### Clean Architecture (Default)

```
src/
├── transport/          # External interfaces (gRPC, HTTP, etc.)
├── domain/            # Business entities and contracts
├── repository/        # Data access layer
└── service/          # Business logic layer
```

### Modular Architecture

```
src/
└── modules/
    └── [module-name]/
        ├── requests/      # Transport layer
        ├── contracts/     # Contracts
        ├── repos/         # Repositories
        └── services/      # Services
```

## 🔍 How It Works

### Smart Import Resolution

Protosmith uses a sophisticated type source mapping system:

1. **Scans All Stub Files** - Reads all compiled proto TypeScript files in the stubs directory
2. **Builds Type Map** - Creates a mapping of which types are exported from which files
3. **Accurate Imports** - Generates import statements that correctly reference the original source file

**Example:**

```typescript
// EWorking on Protosmith

```bash
# Make changes to the code

# Rebuild
pnpm build

# Test your changes
tsx cli.ts generate --interactive

# Or with debug logging
tsx cli.ts generate --interactive --debug
```

### Testing with Sample Project

```bash
# Compile proto files (if you have sample protos)
make genProto

# Run generation
tsx cli.ts generate \
  --service CustomerService \
  --descriptor ./transport/stubs/customer-service.ts \
  --module customer \
  --debug
```

### Using in Your Project

To use Protosmith in your own project while developing:

```bash
# In protosmith directory
npm link

# In your project directory
cd /path/to/your/project
npm link protosmith

# Now use it
protosmith generate --interactiveerate --interactive
```

### Testing

```bash
# Compile proto files
make genProto

# Run generation
pnpm protosmith generate \
  --service CustomerService \
  --descriptor ./transport/stubs/customer-service.ts \
  --module customer
```

## 📝 Configuration

### tsconfig.json

Ensure your `tsconfig.json` has proper path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@transport/*": ["src/transport/*"],
      "@domain/*": ["src/domain/*"],
      "@repository/*": ["src/repository/*"],
      "@service/*": ["src/service/*"],
      "@modules/*": ["src/modules/*"]
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with [protobuf-ts](https://github.com/timostamm/protobuf-ts)
- Powered by [Commander.js](https://github.com/tj/commander.js/)
- Templating with [Handlebars](https://handlebarsjs.com/)

## 📚 Related Projects

- [protobuf-ts](https://github.com/timostamm/protobuf-ts) - Protocol Buffers for TypeScript
- [grpc-js](https://github.com/grpc/grpc-node) - gRPC for Node.js

---

