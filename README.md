# 🔨 Protosmith

A powerful CLI tool for generating TypeScript clean architecture layers from protobuf service definitions. Streamline your gRPC development workflow by automatically generating contracts, repositories, services, and transport layers with intelligent import resolution.

## ✨ Features

- 🔄 **Automatic Code Generation** - Generates TypeScript code from compiled protobuf-ts services
- 🔨 **Auto-Compile Proto Files** - Compile proto files directly without manual protoc commands
- 🎯 **Auto-Detect Services** - Automatically finds and selects generated service descriptor files
- 📝 **Auto-Extract Names** - Service names automatically extracted from compiled TypeScript files
- 🏗️ **Flexible Architecture** - Supports clean, modular, and flat project structures
- 📦 **Smart Import Resolution** - Automatically handles cross-proto imports (e.g., common.proto, shared types)
- 🎯 **Multiple Layers** - Generates contracts, repositories, services, transport, and view model layers
- 🔍 **Type Source Tracking** - Intelligently maps types to their original source files
- 💬 **Interactive Mode** - User-friendly prompts for easy configuration
- 🎨 **Formatted Output** - Generates clean, formatted code with Prettier
- 🎭 **Svelte 5 Support** - Generates view models with Svelte 5 compatible stores
- 📁 **Flat Structure** - All files in one directory, no nested subdirectories

## 📋 Prerequisites

- Node.js >= 20
- TypeScript >= 5.0
- Compiled protobuf files using [protobuf-ts](https://github.com/timostamm/protobuf-ts)
- `protoc` compiler installed (for proto compilation)

### Installing protoc

**macOS:**

```bash
brew install protobuf
```

**Ubuntu/Debian:**

```bash
sudo apt-get install protobuf-compiler
```

**Windows:**
Download from [protobuf releases](https://github.com/protocolbuffers/protobuf/releases)

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

## 🚀 Quick Start

### Option 1: Auto-compile Proto Files (Recommended)

Generate code directly from proto files without manual compilation:

```bash
protosmith generate \
  --service CustomerService \
  --proto-dir proto \
  --module customer \
  --compile-proto \
  --structure clean
```

This command will:

1. Automatically compile all `.proto` files in the `proto` directory to TypeScript
2. Save the compiled stubs in the `stubs` directory (default)
3. Generate the service layers from the compiled stubs

### Option 2: Compile Then Generate

Compile proto files first, then generate:

```bash
# Step 1: Compile proto files
protosmith compile \
  --proto-dir proto \
  --out stubs

# Step 2: Generate layers
protosmith generate \
  --service CustomerService \
  --descriptor stubs/customer-service.ts \
  --module customer
```

### Option 3: Interactive Mode

For a guided experience, use interactive mode:

```bash
protosmith generate --interactive
```

The interactive prompts will guide you through:

1. **Choose Source** - Select between:
   - **From Proto files (auto-compile)** - Automatically compiles proto files to TypeScript, then generates layers
   - **From Compiled TypeScript files** - Uses already compiled proto stubs

2. **If using Proto files:**
   - Select proto directory
   - **Select specific proto files** to compile (you can select multiple files from directory)
   - Choose output directory for compiled stubs (from existing directories or enter custom path)
   - **Auto-detect** generated service descriptor files
   - **Auto-extract** service name from compiled files (or select if multiple services)

3. **If using Compiled files:**
   - Select from available service descriptors

4. **Configuration:**
   - Choose output directory
   - Enter module name
   - Select architecture structure (clean/modules/flat)
   - Choose which layers to generate

**Example Interactive Session:**

```
How would you like to generate code?
❯ From Proto files (auto-compile)
  From Compiled TypeScript files

Select proto directory:
❯ ./proto
  ./api/proto

Select proto files to compile:
✔ customer.proto
✔ common.proto
✖ legacy.proto

Output directory for compiled stubs:
❯ ./stubs
  ./compiled-proto
  ./generated
  ./src/generated
  Enter custom path

[...compiling proto files...]

✓ Compiled 2 proto file(s) to: ./stubs
✓ Found 1 service descriptor(s)
✓ Auto-selected descriptor: customer-service.ts
✓ Auto-detected service name: CustomerService

Select output directory:
[...continue with normal flow...]
```

**When Multiple Services Are Found:**

If compilation generates multiple service descriptor files, you'll be prompted to select one:

```
✓ Found 2 service descriptor(s)

Select service descriptor:
❯ customer-service.ts
  user-service.ts
```

Then the service name is automatically extracted from the selected file.

Select output directory:
❯ ./src
./lib
Enter custom path

Module name (e.g., customer):
❯ customer

Select output structure:
❯ clean
modules
flat

Select layers to generate:
✔ Transport (gRPC requests)
✖ Contract (interfaces)
✖ Repository (implementation)
✖ Service (business logic)
✖ ViewModel (Svelte 5 presentation)

````

**Note:** Interactive mode automatically detects available proto directories and compiled stub files. If no compiled stubs are found, it recommends using the auto-compile option.

### Running Locally

You can run Protosmith locally using one of these methods:

**Method 1: Using tsx (Development)**

```bash
tsx cli.ts generate --interactive
````

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

````

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
````

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

### Example 0: Auto-Compile Proto Files

**Proto Directory Structure:**

```
proto/
├── customer.proto
├── common.proto
└── user.proto
```

**One-Command Generation:**

```bash
protosmith generate \
  --service CustomerService \
  --proto-dir proto \
  --module customer \
  --compile-proto \
  --layers transport,contract,repository,service \
  --verbose
```

This will:

- Find all `.proto` files in `proto/`
- Compile them to TypeScript in `stubs/`
- Auto-detect the compiled `customer-service.ts` descriptor
- Generate all requested layers

**Custom Stub Directory:**

```bash
protosmith generate \
  --service CustomerService \
  --proto-dir proto \
  --stubs-dir compiled-proto \
  --module customer \
  --compile-proto
```

### Example 1: Basic Service Generation

**Compile Only:**

```bash
protosmith compile --proto-dir proto --out stubs
```

**Compile with Custom Options:**

```bash
protosmith compile \
  --proto-dir proto \
  --out compiled-stubs \
  --no-optimize-code-size \
  --verbose
```

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

message GetUserResponse {
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
} from "@transport/gateway/gRPC/stubs/user-service";

export interface UserServiceRepository {
  getUser(input: GetUserRequest): Promise<GetUserResponse>;
  createUser(input: CreateUserRequest): Promise<CreateUserResponse>;
}
```

**Generated Repository:**

```typescript
import { UserServiceRepository } from "@domain/user/user.contract";
import { userGrpcRequests } from "@transport/gateway/gRPC/requests/user.requests";
import type {
  CreateUserRequest,
  CreateUserResponse,
  GetUserRequest,
  GetUserResponse,
} from "@transport/gateway/gRPC/stubs/user-service";

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
        ├── requests/
        │   └── profile.requests.ts      # Transport layer
        ├── contracts/
        │   └── profile.contract.ts      # Contract interfaces
        └── repos/
            └── profile.repo.ts          # Repository implementation
```

### Example 4: Flat Structure

Generate all layers in the same directory:

```bash
protosmith generate \
  --service CustomerService \
  --descriptor ./stubs/customer-service.ts \
  --module customer \
  --structure flat \
  --layers transport,contract,repository,service
```

**Output Structure:**

```
src/
└── modules/
    └── customer/
        ├── customer.requests.ts         # Transport layer
        ├── customer.contract.ts         # Contract interfaces
        ├── customer.repo.ts            # Repository implementation
        └── customer.service.ts        # Service layer
```

**Output Structure:**

```
src/
└── modules/
    └── customer/
        └── customer.service.ts          # All layers in one file
```

**Generated File Structure:**

```typescript
// customer.service.ts - Contains all layers:

// ==================== CONTRACT ====================
export interface CustomerServiceContracts { ... }

// ==================== TRANSPORT ====================
export const customerServiceRequests = { ... }

// ==================== REPOSITORY ====================
export class CustomerServiceGrpcRepository implements CustomerServiceContracts { ... }

// ==================== SERVICE ====================
export class CustomerService { ... }
```

### Example 5: ViewModel Generation (Svelte 5)

Generate view model for UI state management:

```bash
protosmith generate \
  --service PaymentService \
  --descriptor ./stubs/payment-service.ts \
  --module payment \
  --layers viewModel
```

**Generated ViewModel:**

```typescript
import type { UIStatus } from "@/constants/common-definations";
import { PaymentServiceGrpcRepository } from "./payment.repo";
import { writable, type Writable } from "svelte/store";

export class PaymentServiceViewModel {
  private repo: PaymentServiceGrpcRepository;
  private static _instance: PaymentServiceViewModel;

  state: Writable<UIStatus> = writable({ status: "none", message: undefined });

  static getInstance(): PaymentServiceViewModel {
    if (!this._instance) {
      this._instance = new PaymentServiceViewModel(
        new PaymentServiceGrpcRepository(),
      );
    }
    return this._instance;
  }

  async initiatePayment(
    request: InitiatePaymentRequest,
  ): Promise<InitiatePaymentResponse> {
    this.state.set({
      status: "loading",
      message: "Processing initiatePayment...",
    });
    try {
      const response: InitiatePaymentResponse =
        await this.repo.initiatePayment(request);
      this.state.set({
        status: "success",
        message: "initiatePayment completed successfully.",
      });
      return response;
    } catch (error) {
      this.state.set({
        status: "error",
        message: "Failed to process initiatePayment.",
      });
      logger.error("Error in initiatePayment:", error);
      throw error;
    }
  }

  // ... more methods
}
```

**Usage in Svelte 5 Component:**

```svelte
<script>
  import { PaymentServiceViewModel } from '@/modules/payment/payment.view-model';

  const viewModel = PaymentServiceViewModel.getInstance();

  async function handlePayment() {
    try {
      const response = await viewModel.initiatePayment({ amount: 100, currency: 'USD' });
      console.log('Payment successful!', response);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  }
</script>

<button on:click={handlePayment}>Make Payment</button>
```

Note: Import paths vary by structure:

- **Clean**: `@/presentation/payment/payment.view-model.ts`
- **Modules**: `@/modules/payment/view-models/payment.view-model.ts`
- **Flat**: `@/modules/payment/payment.view-model.ts`

**Generated ViewModel:**

```typescript
import type { UIStatus } from "@/constants/common-definations";
import { PaymentServiceGrpcRepository } from "../repos/payment.repo";
import { writable, type Writable } from "svelte/store";

export class PaymentServiceViewModel {
  private repo: PaymentServiceGrpcRepository;
  private static _instance: PaymentServiceViewModel;

  state: Writable<UIStatus> = writable({ status: "none", message: undefined });

  static getInstance(): PaymentServiceViewModel {
    if (!this._instance) {
      this._instance = new PaymentServiceViewModel(
        new PaymentServiceGrpcRepository(),
      );
    }
    return this._instance;
  }

  async initiatePayment(
    request: InitiatePaymentRequest,
  ): Promise<InitiatePaymentResponse> {
    this.state.set({
      status: "loading",
      message: "Processing initiatePayment...",
    });
    try {
      const response: InitiatePaymentResponse =
        await this.repo.initiatePayment(request);
      this.state.set({
        status: "success",
        message: "initiatePayment completed successfully.",
      });
      return response;
    } catch (error) {
      this.state.set({
        status: "error",
        message: "Failed to process initiatePayment.",
      });
      logger.error("Error in initiatePayment:", error);
      throw error;
    }
  }

  // ... more methods
}
```

**Usage in Svelte 5 Component:**

```svelte
<script>
  import { PaymentServiceViewModel } from '@/modules/payment/view-models/payment.view-model';

  const viewModel = PaymentServiceViewModel.getInstance();

  async function handlePayment() {
    try {
      const response = await viewModel.initiatePayment({ amount: 100, currency: 'USD' });
      console.log('Payment successful!', response);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  }
</script>

<button on:click={handlePayment}>Make Payment</button>
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

## 🔨 Auto-Compiling Proto Files

Protosmith now supports automatic proto file compilation! You can skip the manual protoc step and let Protosmith handle everything.

### How It Works

1. Place your `.proto` files in a directory (e.g., `proto/`)
2. Run `protosmith generate` with the `--compile-proto` flag
3. Protosmith will:
   - Find all `.proto` files in the specified directory
   - Compile them to TypeScript using protobuf-ts
   - Save the compiled stubs in the specified output directory (default: `stubs/`)
   - **Auto-detect** generated service descriptor files
   - **Auto-select** the service descriptor (or prompt to select if multiple found)
   - **Auto-extract** service name from the compiled files
   - Generate your layers using the auto-detected information

### Smart Auto-Selection

- **Single Service**: Automatically selected without prompting
- **Multiple Services**: Shows list for you to choose from
- **Service Name**: Automatically extracted from descriptor file name
  - `customer-service.ts` → `CustomerService`
  - `exposed-customer-service.ts` → `CustomerService`
  - `user-service.ts` → `UserService`

### Compile-Only Mode

If you only want to compile proto files without generating layers:

```bash
protosmith compile --proto-dir proto --out stubs
```

### Auto-Compile and Generate

Do it all in one command:

```bash
protosmith generate \
  --service CustomerService \
  --proto-dir proto \
  --module customer \
  --compile-proto
```

### Advanced Compile Options

```bash
protosmith compile \
  --proto-dir proto \
  --out compiled-stubs \
  --no-optimize-code-size \
  --no-long-type-number \
  --verbose
```

## 🔧 CLI Options

### `compile` Command

| Option                    | Description                           | Default |
| ------------------------- | ------------------------------------- | ------- |
| `--proto-dir <path>`      | Directory containing proto files      | `proto` |
| `--out <path>`            | Output directory for compiled files   | `stubs` |
| `--no-optimize-code-size` | Disable code size optimization        | `true`  |
| `--no-long-type-number`   | Disable long type number optimization | `true`  |
| `--verbose`               | Enable verbose logging                | `false` |
| `--debug`                 | Enable debug logging                  | `false` |

### `generate` Command

| Option                | Description                                           | Default    |
| --------------------- | ----------------------------------------------------- | ---------- |
| `--interactive`       | Enable interactive mode with prompts                  | `false`    |
| `--service <name>`    | Service name from proto file                          | Required   |
| `--descriptor <path>` | Path to compiled proto TypeScript file                | Required   |
| `--module <name>`     | Module name for generated files                       | Required   |
| `--proto-dir <path>`  | Directory containing proto files (for auto-detection) | -          |
| `--out <path>`        | Output root directory                                 | `src`      |
| `--structure <type>`  | Architecture structure: `clean`, `modules`, or `flat` | `clean`    |
| `--layers <layers>`   | Comma-separated layers to generate                    | All layers |
| `--compile-proto`     | Automatically compile proto files before generation   | `false`    |
| `--stubs-dir <path>`  | Output directory for compiled proto stubs             | `stubs`    |
| `--verbose`           | Enable verbose logging                                | `false`    |
| `--debug`             | Enable debug logging                                  | `false`    |

### Available Layers

- **transport** - gRPC request handlers and client interactions
- **contract** - TypeScript interfaces defining repository contracts
- **repository** - Repository implementations connecting to gRPC
- **service** - Business logic service layer
- **viewModel** - Svelte 5 view model with state management

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

### Flat Architecture

All layers in same directory, no subdirectories:

```
src/
└── modules/
    └── [module-name]/
        ├── [module-name].requests.ts
        ├── [module-name].contract.ts
        ├── [module-name].repo.ts
        ├── [module-name].service.ts
        └── [module-name].view-model.ts
```

### Architecture Comparison

| Structure | Directory Depth | File Organization | Best For                                       |
| --------- | --------------- | ----------------- | ---------------------------------------------- |
| `clean`   | Deep            | Layer-based       | Large enterprise apps with strict architecture |
| `modules` | Medium          | Module-based      | Medium projects with clear module boundaries   |
| `flat`    | Shallow         | Flat files        | Prototyping, microservices, minimal projects   |

## 🔍 How It Works

### Smart Import Resolution

Protosmith uses a sophisticated type source mapping system:

1. **Scans All Stub Files** - Reads all compiled proto TypeScript files in the stubs directory
2. **Builds Type Map** - Creates a mapping of which types are exported from which files
3. **Accurate Imports** - Generates import statements that correctly reference the original source file

**Example:**

````typescript
// EWorking on Protosmith

```bash
# Make changes to the code

# Rebuild
pnpm build

# Test your changes
tsx cli.ts generate --interactive

# Or with debug logging
tsx cli.ts generate --interactive --debug
````

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
