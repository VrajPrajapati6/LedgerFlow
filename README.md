# LedgerFlow

Event-Sourced Financial Infrastructure Platform

## Project Overview

LedgerFlow is an enterprise-grade internal financial infrastructure platform designed for banking operations engineers, financial auditors, fraud analysts, and risk teams. Unlike consumer-facing digital wallets or retail banking applications, LedgerFlow functions as a system of record and core ledger management console. It provides immutable transaction tracking, dual-entry accounting guarantees, real-time auditability, automated reconciliation, and automated fraud rule detection. 

The platform is designed to sit behind external client-facing interfaces, acting as the definitive source of truth for financial balances and events. All operations are backed by event-sourcing and double-entry bookkeeping mechanisms, ensuring that money is never created or destroyed arbitrarily, and that every financial state change is fully auditable and restorable to any microsecond in time.

## Problem Statement

Traditional transactional databases relying solely on CRUD (Create, Read, Update, Delete) patterns are fundamentally ill-suited for core financial ledgering due to the following critical industry challenges:

1. **Transaction Failures and State Drift**: In standard CRUD architectures, updating a balance field and inserting a transaction record are typically handled in a distributed transaction or separate database operations. If an update fails mid-execution, database state can drift from actual physical transactions, resulting in phantom balances.
2. **Auditing and Verification Constraints**: Financial auditors require the ability to verify how a specific account reached its current balance. In a database that overwrites rows (e.g. updating a `balance` column in an `accounts` table), historical trace information is lost, making forensic accounting difficult, slow, or impossible.
3. **Fraud Detection Latency**: Traditional fraud detection runs asynchronously on batch data pipelines hours or days after transactions occur. This latency exposes financial institutions to major losses from rapid velocity attacks or circular transfer loops.
4. **Settlement and Reconciliation Mismatches**: Financial institutions continuously interact with third-party payment rails (e.g. Fedwire, ACH, SWIFT, card networks). Mismatches between internal transaction state and external clearing bank settlements often go undetected without continuous, automated, double-entry verification.
5. **Historical Balance Reconstruction**: To generate regulatory reports for past fiscal dates, operations teams must reconstruct the exact balance of thousands of accounts at specific timestamps. Reconstructing this from standard database logs is highly compute-intensive and prone to boundary errors.

## Solution

LedgerFlow resolves these fundamental limitations through a unified architecture combining:

1. **Event Sourcing**: The current balance of an account is never stored as an editable value. Instead, the balance is a computed projection of a series of immutable, sequential historical journal entries (debits and credits).
2. **Double Entry Bookkeeping**: Every transaction in LedgerFlow requires at least one Debit and one Credit entry that sum to exactly zero. This system guarantees the conservation of money across the entire platform.
3. **State Replay Engine**: The system can replay the ledger event stream up to any arbitrary point-in-time to reconstruct the exact historical state of any account.
4. **Snapshot Engine**: To prevent performance degradation during state replay for long-lived accounts, LedgerFlow periodically writes cryptographic snapshots of account balances at specific event boundaries, limiting the required replay window to post-snapshot entries.
5. **Real-time Fraud Engine**: All incoming transactions are automatically evaluated against a configurable rule engine (evaluating velocity limits, repeated amount sequences, transfer value spikes, and circular loops) to block or flag high-risk accounts.
6. **Automated Reconciliation**: LedgerFlow matches internal ledger records against external banking settlement logs, generating reports on missing records, duplicate runs, status discrepancies, and value mismatches.
7. **Immutable Audit Trails**: The transaction log is write-once, read-many (WORM). It is structured to prevent any updates or deletions, satisfying compliance regulations under Sox and Basel III.

## Target Users

LedgerFlow serves as the command center for the following key internal operating roles:

| Role | Core Console Workflows |
|---|---|
| **Banking Operations Engineers** | Monitoring infrastructure health, managing account states, inspecting high-value transfers, and debugging message queue issues. |
| **Financial Auditors** | Replaying historical balances to verify accounting integrity, auditing double-entry balances, and exporting compliance reports. |
| **Fraud & Risk Analysts** | Reviewing automated risk alerts, investigating flagged accounts, modifying velocity thresholds, and disabling compromised entities. |
| **Compliance Officers** | Verifying KYC statuses, reporting suspicious transaction patterns, and managing anti-money laundering (AML) reports. |
| **Site Reliability Engineers (SRE)** | Monitoring API latency baselines, checking ledger engine database write queues, and managing snapshot frequency settings. |

## Core Features

### Accounts Management
Complete lifecycle administration of financial accounts. Operations teams can block, activate, or close accounts. The module displays unique account identifiers, current projected balances, and risk status indicators derived from the fraud engine.

### Deposits & Transfers
The ingestion points for financial events. Deposits inject capital into the ledger structure via a single offset system (crediting the target account and debiting a system clearing account). Transfers perform atomized, double-entry ledgering between two participant accounts.

### Immutable Ledger & Double Entry
Every transaction is translated into a set of balanced ledger entries. A transaction contains one or more `DEBIT` entries and one or more `CREDIT` entries. The total absolute value of `DEBIT` entries must equal the total absolute value of `CREDIT` entries.

### Historical Replay & Point-in-Time Balance
Enables operators to input any historical timestamp (UTC) and calculate the exact state of an account at that millisecond. This feature leverages the Event Sourcing architecture to dynamically replay double-entry journals.

### Snapshot Optimization
To maintain sub-millisecond response times, the Snapshot Engine periodically registers the account balance state and the last processed `LedgerEntry` ID. When a balance query is executed, the engine loads the closest snapshot and only replays ledger events created after that snapshot.

### Fraud Detection Center
A real-time rule engine that processes transactions pre-execution. It scores transactions based on:
- **Velocity**: Rate of transfers within a rolling window.
- **Repeated Amounts**: Sequential transfers of identical values suggesting robotic loops.
- **Spikes**: Deviation from historical transfer averages.
- **Circular Paths**: Loop transfers between accounts trying to inflate transaction volumes.

### Automated Reconciliation
An auditing interface that ingests external clearing data and runs matching algorithms. It flags discrepancies, duplicate payments, status mismatches (e.g. succeeded internally but failed externally), and missing records.

### System Observability & Health
An SRE-focused dashboard displaying API response latencies, gateway statuses, snapshot execution counts, pending system transactions, and database health metrics.

## High-Level Architecture

The following diagram illustrates the flow of data through the LedgerFlow platform:

```
+-----------------------------------------------------------+
|                      Frontend Console                     |
|            Next.js App Router / Tailwind CSS              |
+-----------------------------+-----------------------------+
                              |
                              | HTTP REST API
                              v
+-----------------------------+-----------------------------+
|                        Backend API                        |
|             Express.js / TypeScript Gateway               |
+-----+-------------------+-------------------+-------------+
      |                   |                   |
      v                   v                   v
+-----+-----+       +-----+-----+       +-----+-----+
|  Ledger   |       |   Fraud   |       |  Recon    |
|  Engine   |       |  Engine   |       |  Engine   |
+-----+-----+       +-----+-----+       +-----+-----+
      |                   |                   |
      |                   v                   |
      |             +-----+-----+             |
      +------------>| Snapshot  |<------------+
                    |  Engine   |
                    +-----+-----+
                          |
                          v
+-------------------------+---------------------------------+
|                    Persistence Layer                      |
|                Prisma Client / PostgreSQL                 |
+-----------------------------------------------------------+
```

### Architecture Component Layers
1. **Frontend Console**: A client-side, light-theme Next.js application that provides clean operational views of the system. It connects to the backend REST API via react-query.
2. **REST API Gateway**: An Express.js application written in TypeScript that validates incoming requests, handles authentication, and routes actions to specialized business modules.
3. **Ledger Engine**: The core transactional handler. It enforces double-entry rules, creates ledger entries, and computes current balances by querying snapshots and replaying subsequent events.
4. **Fraud Engine**: A synchronous rule execution engine that calculates risk scores for every pending transaction before the ledger writes the entries.
5. **Reconciliation Engine**: An asynchronous matching processor that evaluates internal ledger data against uploaded external settlement files, identifying anomalies.
6. **Snapshot Engine**: A background worker that tracks ledger event density per account and generates balance checkpoints to accelerate state reconstruction.
7. **Persistence Layer**: A relational database (PostgreSQL) managed through the Prisma ORM.

## Backend Architecture

The backend follows a modular monolith architecture. Each domain (Account, Transaction, Ledger, Snapshot, Fraud, Reconciliation) is isolated within its own module containing dedicated controllers, services, routers, and validators.

### Request-Response Lifecycle
The lifecycle of an API request is defined by the following sequential pipeline:

```
[ Client Request ]
        |
        v
 [ Express Router ]  --> Map path to corresponding controller
        |
        v
[ Input Validator ]  --> Check schema (e.g., validate UUIDs, amounts)
        |
        v
  [ Controller ]     --> Extract parameters, manage HTTP response mapping
        |
        v
    [ Service ]      --> Execute core business rules and query database
        |
        v
  [ Prisma ORM ]     --> Translate TypeScript queries to raw SQL
        |
        v
  [ PostgreSQL ]     --> Execute query and return relational data
        |
        v
  [ Controller ]     --> Format response payload (DTO serialization)
        |
        v
 [ Client Response ]
```

### Component Layer Responsibilities
- **Router**: Maps paths to controllers and chains middleware (e.g. validator validation).
- **Validator**: Enforces schema rules using middleware to prevent invalid data from reaching the controllers.
- **Controller**: Manages the HTTP interface. It extracts parameters from `req.body` or `req.params`, passes them to the service layer, and maps service exceptions to appropriate HTTP status codes.
- **Service**: Implements business logic. This is the only layer allowed to read and write database state via the Prisma Client.
- **Prisma Client / PostgreSQL**: Manages database connections, connection pooling, and transactional isolation.

## Frontend Architecture

The frontend is a modern Next.js single-page application optimized for data-density and quick operational interaction.

### Architecture Highlights
- **Next.js App Router**: Implements nested routing and page layouts.
- **Feature-Based Module Organization**: Features are grouped inside a top-level `features/` folder. Pages import aggregated feature blocks, keeping routes slim.
- **React Query Cache**: Implements automatic background refetching and client-side cache synchronization. When an operations engineer creates an account or submits a transfer, related queries are invalidated and re-polled instantly.
- **Shadcn UI & Tailwind CSS**: Implements a minimal, light-theme interface. Features custom components designed around slate borders (`border-slate-200`), white card containers (`bg-white`), and blue primary accent colors (`bg-blue-600`).
- **Responsive Table Frameworks**: Tables use horizontal scrolling wrappers and sticky headers to support rich datasets on multiple screen resolutions.

## Folder Structure

```
LedgerFlow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema & relationships
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts          # Relational client setup
│   │   ├── modules/
│   │   │   ├── account/           # Account controllers & services
│   │   │   ├── fraud/             # Fraud scoring rules engine
│   │   │   ├── ledger/            # Double-entry ledger engine
│   │   │   ├── reconciliation/    # Settlement matching processor
│   │   │   ├── snapshot/          # Replay checkpoint generator
│   │   │   └── transaction/       # Core transfer & deposit handlers
│   │   ├── shared/                # Global types and helpers
│   │   ├── app.ts                 # Express application setup
│   │   └── server.ts              # API server listener
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── app/                       # Next.js pages and layouts
    ├── components/
    │   ├── layout/                # Global layout shell & sidebar
    │   ├── ui/                    # Reusable shadcn elements
    │   └── feedback/              # Loaders and error states
    ├── features/                  # Business-oriented page widgets
    ├── hooks/                     # Shared hooks
    ├── lib/                       # Utility functions
    ├── providers/                 # React Query wrapper
    ├── services/
    │   └── api/                   # HTTP service client integrations
    ├── styles/                    # Tailwind CSS definitions
    ├── types/                     # TypeScript model declarations
    ├── tsconfig.json
    └── package.json
```

## Database Design

LedgerFlow uses a highly relational PostgreSQL schema. Relational integrity is enforced via foreign keys and cascades.

### Relational Schema Diagram
```
  +------------------+          +------------------+
  |     Account      |          |   Transaction    |
  +------------------+          +------------------+
  | id (PK)          |<---+     | id (PK)          |<---+
  | userId           |    |     | reference        |    |
  | accountType      |    |     | status           |    |
  | currency         |    |     | createdAt        |    |
  | status           |    |     +------------------+    |
  | createdAt        |    |                             |
  +------------------+    |                             |
    |    |    |           |                             |
    |    |    +----------------------------------+      |
    |    |                |                      |      |
    |    v                |                      v      |
    |  +------------------+----+               +--+-----+----------+
    |  |     Snapshot     |    |               |    LedgerEntry    |
    |  +------------------+    |               +-------------------+
    |  | id (PK)          |    |               | id (PK)           |
    |  | accountId (FK)   |    |               | accountId (FK)    |
    |  | balance          |    |               | transactionId (FK)|
    v  | lastEventId      |    |               | entryType         |
  +----+-------------+    |    |               | amount            |
  |    FraudAlert    |    |    |               | description       |
  +------------------+    |    |               | createdAt         |
  | id (PK)          |    |    |               +-------------------+
  | transactionId(FK)-----+    |
  | accountId (FK)   |         |
  | riskScore        |         |
  | severity         |         |
  | triggeredRules   |         |
  | createdAt        |         |
  +------------------+         |
                               |
  +----------------------------+
  | ExternalSettlement         |
  +----------------------------+
  | id (PK)                    |
  | transactionId              |
  | amount                     |
  | status                     |
  | settlementTimestamp        |
  | createdAt                  |
  +----------------------------+

  +----------------------------+          +----------------------------+
  |     ReconciliationRun      |          |   ReconciliationFailure    |
  +----------------------------+          +----------------------------+
  | id (PK)                    |<---------| id (PK)                    |
  | totalMatched               |          | runId (FK)                 |
  | totalMismatched            |          | transactionId              |
  | createdAt                  |          | mismatchType               |
  |                            |          | details                    |
  |                            |          | createdAt                  |
  +----------------------------+          +----------------------------+
```

### Table Definitions

#### Account
Stores identity, currency type, and configuration for financial balances.
- `id` (UUID, Primary Key): Unique account identifier.
- `userId` (String): Owner identifier.
- `accountType` (String): e.g. "SAVINGS", "CHECKING", "SYSTEM_RESERVE".
- `currency` (String): ISO 3-letter currency code (e.g. "USD", "EUR").
- `status` (Enum: `ACTIVE`, `BLOCKED`, `CLOSED`): State check for transactions.
- `createdAt` (Timestamp): Record instantiation time.

#### Transaction
Groups associated double-entry ledger lines.
- `id` (UUID, Primary Key): Unique transaction identifier.
- `reference` (String, Optional): External reference mapping.
- `status` (Enum: `PENDING`, `SUCCESS`, `FAILED`, `REVERSED`): Lifecycle state.
- `createdAt` (Timestamp): Record creation time.

#### LedgerEntry
Stores individual credit/debit lines. Ledger entries are write-once, read-never-modify.
- `id` (UUID, Primary Key): Unique ledger entry identifier.
- `accountId` (UUID, Foreign Key): Reference to the account target.
- `transactionId` (UUID, Foreign Key): Reference to the parent transaction record.
- `entryType` (Enum: `DEBIT`, `CREDIT`): Direction of money flow.
- `amount` (Decimal): Precise numeric value (supported up to 18 decimals).
- `description` (String, Optional): Operational description.
- `createdAt` (Timestamp): Timestamp used by the replay engine.

#### Snapshot
Saves physical balances at specific ledger timeline checkpoints.
- `id` (UUID, Primary Key): Unique snapshot identifier.
- `accountId` (UUID, Foreign Key): Reference to the target account.
- `balance` (Decimal): Validated physical balance.
- `lastEventId` (UUID): The ID of the last ledger entry evaluated.
- `createdAt` (Timestamp): Checkpoint timestamp.

#### FraudAlert
Logs risk assessments generated by the Fraud Engine.
- `id` (UUID, Primary Key): Unique alert identifier.
- `transactionId` (UUID, Foreign Key): Associated transaction reference.
- `accountId` (UUID, Foreign Key): Target account reference.
- `riskScore` (Integer): Score from 0 (Safe) to 100 (Maximum Risk).
- `severity` (String): Severity indicator ("LOW", "MEDIUM", "HIGH").
- `triggeredRules` (Array of Strings): Identifiers of the specific rules violated.
- `createdAt` (Timestamp): Audit time.

#### ExternalSettlement
Mock dataset of third-party clearings used for reconciliation checking.
- `id` (UUID, Primary Key): Settlement record ID.
- `transactionId` (UUID): Reference ID to match against local records.
- `amount` (Decimal): Settled amount.
- `status` (String): External transaction status ("SUCCESS", "FAILED").
- `settlementTimestamp` (Timestamp): External execution time.
- `createdAt` (Timestamp): Data ingestion time.

#### ReconciliationRun
Tracks individual runs of the reconciliation scan.
- `id` (UUID, Primary Key): Unique scan ID.
- `totalMatched` (Integer): Volume of matching records.
- `totalMismatched` (Integer): Volume of anomalies flagged.
- `createdAt` (Timestamp): Execution time.

#### ReconciliationFailure
Individual failure entries associated with a run.
- `id` (UUID, Primary Key): Mismatch identifier.
- `runId` (UUID, Foreign Key): Reference to the parent run.
- `transactionId` (UUID): Identified transaction with mismatch issues.
- `mismatchType` (String): Error classification ("MISSING_SETTLEMENT", "AMOUNT_MISMATCH", "STATUS_MISMATCH", "DUPLICATE_SETTLEMENT").
- `details` (String): Human-readable summary of the mismatch.
- `createdAt` (Timestamp): Creation time.

## System Workflow

When a client requests a fund transfer between Account A and Account B, the platform executes the following step-by-step pipeline:

```
[ Transfer Request Recieved ]
             |
             v
+----------------------------+
| 1. Account Integrity Check | --> Validate active state, matching currencies,
+------------+---------------+     and sufficient balance via Replay Engine
             |
             v
+----------------------------+
| 2. Fraud Rules Check       | --> Analyze transaction velocity, amounts, circular 
+------------+---------------+     routes. Blocks/flags if risk score > threshold
             |
             v
+----------------------------+
| 3. Create Transaction DB   | --> Instantiates Transaction with status "PENDING"
+------------+---------------+
             |
             v
+----------------------------+
| 4. Create Ledger Entries   | --> Generates balancing DEBIT and CREDIT entries
+------------+---------------+     within a database transaction block
             |
             v
+----------------------------+
| 5. Process Settlement      | --> Integrates with banking system. On completion,
+------------+---------------+     sets Transaction status to "SUCCESS"
             |
             v
+----------------------------+
| 6. Trigger Snapshot Check  | --> Background check: if transaction density > threshold,
+------------+---------------+     generates new Snapshot checkpoint
             |
             v
+----------------------------+
| 7. Update UI Console       | --> Invalidates React Query caches; dashboard cards, 
+----------------------------+     health, ledger and account views refresh
```

1. **Account Integrity Check**: The service checks that both accounts exist, are in an `ACTIVE` status, and share matching currency codes. The source account's balance is computed via the Replay Engine to ensure sufficient funds.
2. **Fraud Rules Check**: The transaction is sent to the Fraud Engine. If rules are violated, a `FraudAlert` is written. If the risk score exceeds 70, the transaction is rejected; otherwise, execution proceeds.
3. **Transaction Record Creation**: A transaction row is written to the database with status `PENDING`.
4. **Ledger Entries Creation**: Within a single database transaction, the engine inserts a `DEBIT` entry against Account A and a `CREDIT` entry against Account B. If writing either entry fails, the database transaction aborts.
5. **Reconciliation Mapping**: During external clearing cycles, the settlement file is processed by the Reconciliation Engine. Discrepancies generate a `ReconciliationFailure`.
6. **Snapshot Evaluation**: A background job checks if the account has accumulated more than 100 new ledger entries since its last snapshot. If so, it computes the balance and inserts a new `Snapshot`.
7. **Observer Notification**: The API returns the completed transaction. React Query invalidates cached lists, and the frontend updates the dashboard KPI cards, table views, and status metrics.

## Event Sourcing

LedgerFlow uses Event Sourcing for core balance management. Instead of treating the database as a storage container for current state, LedgerFlow treats the database as an immutable log of state changes.

### Core Architecture Concepts
- **Events are the Source of Truth**: Every deposit, withdrawal, and transfer is written as an immutable event. The current balance is a read projection computed by summing these events.
- **Immutability**: Event records cannot be updated or deleted. Correcting an error requires writing a compensating event (e.g. a reversal transaction), matching real-world accounting practices.

### Key Advantages
- **Perfect Audit Trail**: Provides an automatic, granular history of all transactions.
- **Point-in-Time Queries**: Balance query parameters support history traversal, facilitating regulatory compliance reports.
- **Robust Concurrency**: Since events are append-only, write operations avoid row-level lock contention on account records.

### Trade-offs & Mitigations
- **Computational Overhead**: Summing millions of ledger entries to calculate a balance is compute-intensive. LedgerFlow mitigates this by utilizing the Snapshot Engine.
- **Schema Evolution**: Altering the event structure requires careful mapping. LedgerFlow maintains simple, decoupled transaction models to keep schema changes minimal.

## Double Entry Bookkeeping

Double-entry bookkeeping is a foundational accounting standard. LedgerFlow enforces this standard at the database layer to guarantee financial correctness.

### Key Principles
- **Ledger Invariant**: For every transaction, the algebraic sum of all credit and debit entries must equal zero:
  
  $$\sum \text{LedgerEntries.Amount} = 0$$

  Where debits are modeled as negative numbers and credits are modeled as positive numbers (or vice versa, depending on context).
- **Conservation of Money**: Money cannot be created or destroyed. It can only be transferred between accounts.
- **System Offsets**: External funding events (like cash deposits or wire receipts) use system-level offset accounts (e.g. `SYSTEM_RESERVE`) to ensure double-entry constraints are met.

### Implementation Pattern in LedgerFlow
```typescript
const balance = await prisma.$transaction(async (tx) => {
  // 1. Create parent transaction record
  const transaction = await tx.transaction.create({ data: { status: "SUCCESS" } });

  // 2. Create double-entry credit record
  await tx.ledgerEntry.create({
    data: {
      accountId: toAccountId,
      transactionId: transaction.id,
      entryType: "CREDIT",
      amount: new Prisma.Decimal(amount),
    }
  });

  // 3. Create double-entry debit record
  await tx.ledgerEntry.create({
    data: {
      accountId: fromAccountId,
      transactionId: transaction.id,
      entryType: "DEBIT",
      amount: new Prisma.Decimal(amount).negated(),
    }
  });
});
```

This pattern ensures that both sides of the transaction are written within a single database transaction, preventing imbalanced records.

## Replay Engine

The Replay Engine is responsible for state reconstruction. To calculate an account's balance at any target timestamp $T$:

$$\text{Balance}_T = \sum \{ \text{Entry.Amount} \mid \text{Entry.createdAt} \le T \}$$

### Balance Evaluation Process
1. Locate the latest snapshot for the target account created at or before $T$.
2. If a snapshot is found, initialize the running balance to the snapshot's recorded value.
3. Query all ledger entries for the target account created after the snapshot's creation time and up to $T$.
4. Iterate through the ledger entries, adding or subtracting their values from the running balance based on their entry types.
5. If no snapshot is found, query all ledger entries from the account's inception up to $T$ and compute the sum.

This approach allows LedgerFlow to construct balance histories at specific dates and times, facilitating auditing and regulatory compliance.

## Snapshot Engine

As the number of transaction events increases, replaying the entire history of an account becomes a bottleneck. The Snapshot Engine addresses this latency curve:

```
[ Replay Query Execution Flow ]

Without Snapshots:
Query LedgerEntries (Inception to Time T) -> Iterate and Sum -> Calculate Balance
Execution Time: O(N) where N is the total number of events.

With Snapshots:
Load Latest Snapshot (Time S <= T) -> Query LedgerEntries (S to T) -> Add to Snapshot -> Calculate Balance
Execution Time: O(K) where K is the number of events since the last snapshot (K << N).
```

### Technical Design
- **Snapshot Trigger**: The backend evaluates account event count during transfers. If the threshold (e.g. 100 new entries) is met, a snapshot task is queued.
- **Immutability**: Like ledger entries, snapshots are write-only. If a correction is made to a historical ledger event, all snapshots dated after that event are discarded and reconstructed.

## Fraud Detection

The Fraud Engine acts as a gatekeeper during the transaction pipeline. It evaluates the following rules:

### Rules Definition

#### 1. Velocity Limit Check (`VELOCITY_LIMIT_EXCEEDED`)
Evaluates the transaction count for an account within a rolling window. If the account exceeds 5 transfers (DEBIT entries) within 60 seconds, this rule triggers (+40 points).

#### 2. Repeated Amount Pattern (`REPEATED_AMOUNT_PATTERN`)
Monitors consecutive transactions for matching values. If the account processes 3 consecutive transfers of the identical amount, this rule triggers (+20 points).

#### 3. Large Transfer Spike (`LARGE_TRANSFER_SPIKE`)
Evaluates value variance. If the pending transfer amount exceeds 3x the average of all historical transfer debits for that account, this rule triggers (+30 points).

#### 4. Circular Transfer Loop (`CIRCULAR_TRANSFER`)
Monitors looping patterns between entities. If Account A attempts a transfer to Account B, the engine checks if Account B transferred funds back to Account A within the preceding 10 minutes. If so, this rule triggers (+20 points).

### Scoring and Severity Aggregation
The individual rule scores are aggregated to calculate a risk score from 0 to 100:

- **Low Risk** (Score 0 to 30): Allowed.
- **Medium Risk** (Score 31 to 70): Allowed, but flags a warning and creates a `FraudAlert` record.
- **High Risk** (Score 71 to 100): Rejected. The transaction status is updated to `FAILED`, and a high-severity `FraudAlert` is written.

## Reconciliation Engine

Reconciliation verifies internal records against external data sources (e.g. banks or clearing houses). 

### Discrepancy Rules

| Mismatch Type | Triggering Condition |
|---|---|
| `MISSING_SETTLEMENT` | An internal transaction has a `SUCCESS` status, but no matching external settlement record exists in the uploaded log. |
| `DUPLICATE_SETTLEMENT` | Multiple external settlement records are mapped to a single internal transaction ID. |
| `AMOUNT_MISMATCH` | The external settled amount does not match the internal ledger entry amount. |
| `STATUS_MISMATCH` | The internal transaction status is set to `SUCCESS` but the external settlement file reports the transfer as `FAILED`. |

### Execution & Logging
Reconciliation runs are logged under the `ReconciliationRun` model. Failed matches are logged as `ReconciliationFailure` records, which operators inspect through the Reconciliation Center console view.

## Console Views

LedgerFlow features nine core console views tailored to financial operations workflows:

1. **Dashboard**: The central hub, containing high-level metrics (active accounts, system transaction volumes, fraud risks, reconciliation match rates) and charting widgets.
2. **Accounts Explorer**: An operations interface displaying all accounts in a paginated data table, with search and filtering capabilities by status, currency, and risk level.
3. **Account Details**: A profile view displaying an account's historical balance charts, transaction history, audit trails, and risk scoring.
4. **Transactions Log**: A system-level log detailing transaction reference numbers, statuses, timestamps, and amounts, with an inspection side-sheet.
5. **Ledger Explorer**: A double-entry visualizer displaying credits and debits, with tools to verify ledger balancing.
6. **Fraud Center**: A monitoring station displaying triggered alerts, risk levels, and specific rule violations.
7. **Reconciliation Center**: An audit view containing match rates, mismatch breakdowns, and action items to address settlement errors.
8. **Audit Trail Explorer**: A forensic console enabling operators to query historical balances at specific dates and times.
9. **Snapshot Manager**: A dashboard displaying generated snapshots and database optimization metrics.

## Technology Stack

The platform is built using the following technologies:

| Category | Technology |
|---|---|
| **Frontend Framework** | Next.js 16.2 (App Router) |
| **Frontend Styling** | Tailwind CSS v4, Tailwind-Merge |
| **State Caching** | React Query (TanStack Query) |
| **Data Visualization** | Recharts |
| **UI Components** | Shadcn UI, Radix UI |
| **Runtime Environment** | Node.js v20+, TypeScript |
| **Backend Framework** | Express.js v5 |
| **Database ORM** | Prisma Client v7 |
| **Primary Database** | PostgreSQL |
| **Development Utilities** | Tsx, ESLint, TypeScript Compiler |

## Installation

### Prerequisites
- Node.js v20.x or higher
- npm v10.x or higher
- A running PostgreSQL database instance (or cloud host e.g. Neon)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/LedgerFlow.git
cd LedgerFlow
```

### Step 2: Configure the Backend Environment
Navigate to the `backend` directory, create a `.env` file, and populate it with your database connection string:
```bash
cd backend
cp .env.example .env
```
Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ledgerflow?schema=public"
PORT=3001
```

### Step 3: Install Backend Dependencies and Run Migrations
```bash
npm install
npx prisma db push
```

### Step 4: Seed Initial Data
To generate mock accounts and transactions, run the test/seed script:
```bash
npm run dev
```
*(Optionally run backend test scripts inside `src/scripts` to seed specific fraud or reconciliation cases)*

### Step 5: Configure the Frontend Environment
Navigate to the `frontend` directory:
```bash
cd ../frontend
npm install
```

### Step 6: Start Development Servers
- **Backend API**: Run `npm run dev` in `backend` (starts the server on port 3001).
- **Frontend Console**: Run `npm run dev` in `frontend` (starts the console on port 3000).

Open your browser to `http://localhost:3000` to access the LedgerFlow Dashboard.

## Environment Variables

### Backend Configuration
- `DATABASE_URL` (Required): Connection URI for the target PostgreSQL database.
- `PORT` (Default: `3001`): The port the Express API listens on.

### Frontend Configuration
- `NEXT_PUBLIC_API_URL` (Default: `http://localhost:3001`): The URL of the backend API gateway.

## API Overview

### Accounts Module
- `POST /accounts`: Create a new financial account.
- `GET /accounts`: Retrieve a paginated list of accounts.
- `GET /accounts/:id`: Get detailed metadata for a specific account.

### Transactions Module
- `POST /transactions/deposit`: Record a new deposit.
- `POST /transactions/transfer`: Record a transfer transaction (enforces double-entry and runs fraud checks).
- `GET /transactions`: Retrieve system-level transaction logs.
- `GET /transactions/:id`: Get detailed metadata for a specific transaction.

### Ledger Explorer
- `GET /ledger`: Retrieve raw double-entry ledger journals.
- `GET /ledger/:accountId/history`: Get ledger history for a specific account.
- `GET /ledger/:accountId/balance-at`: Reconstruct an account balance at a specific UTC timestamp.

### Snapshot Manager
- `GET /snapshots`: Retrieve a list of generated snapshots.
- `POST /snapshots/:accountId/create`: Manually trigger snapshot generation for an account.

### Fraud Engine
- `GET /fraud/alerts`: Retrieve a list of fraud alerts.
- `GET /fraud/:accountId/history`: Retrieve the fraud log for a specific account.

### Reconciliation Engine
- `POST /reconciliation/run`: Manually trigger a reconciliation scan.
- `GET /reconciliation/report`: Retrieve the latest reconciliation matching report.
- `GET /reconciliation/failures`: Retrieve a list of reconciliation failures.

## Design Principles

1. **Modular Monolith Architecture**: High cohesion within modules and low coupling between modules ensures that the platform is easy to maintain and scale.
2. **Separation of Concerns**: Controllers handle transport layers, services execute business logic, and Prisma handles SQL abstraction.
3. **Immutability of Historical Ledger Records**: Once written, ledger events cannot be changed. Corrective actions are processed via compensating entries.
4. **Relational Consistency**: Database foreign keys and transaction isolation levels guarantee data integrity across accounts, ledger lines, and snapshots.
5. **Fail-Fast Verification**: Balance checks and fraud rules run before transactions are written, preventing downstream failures.

## Future Improvements

1. **Kafka Event Streaming Integration**: Transition from local event dispatching to a distributed Apache Kafka messaging bus to support high-throughput payment queues.
2. **Redis Cache Layer**: Implement Redis caches for account details and computed balances to reduce PostgreSQL read volume.
3. **CQRS Architecture Separation**: Formally segregate write databases (optimized for writes) from read databases (optimized for complex analytical projections).
4. **Machine Learning-Driven Fraud Models**: Deploy Python-based ML microservices to run anomaly detection models alongside the existing rules engine.
5. **Multi-Currency FX Ledgering**: Implement multi-currency exchange rates and automated FX balancing ledger systems.