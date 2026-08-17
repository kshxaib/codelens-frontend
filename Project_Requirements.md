# CodeLens --- Complete Project Requirements

## 1. Project Identity

**Project Name:** CodeLens\
**Full Name:** CodeLens --- AI-Powered Codebase Intelligence Copilot

**Tagline:**\
\> Understand any codebase. Trace dependencies. Verify every answer.

------------------------------------------------------------------------

## 2. Problem Definition

Large software repositories contain thousands of files, functions,
classes, APIs, dependencies, and configuration files. New developers
often spend significant time manually exploring unfamiliar repositories
to understand where functionality is implemented, how different
components interact, why certain code exists, and what could be affected
by changing a function.

Generic AI coding assistants may operate with limited repository context
and can provide answers without sufficient evidence or exact references.

**CodeLens solves this problem by providing an AI-powered conversational
assistant that indexes an entire authorized GitHub repository, retrieves
relevant code and dependency information using code-aware RAG, and
generates grounded answers with clickable file and line-number
citations.**

------------------------------------------------------------------------

## 3. Main Goal

Build a full-stack web application where developers can:

-   Sign in with GitHub.
-   View repositories they have access to.
-   Select a repository.
-   Add a repository using a GitHub URL.
-   Verify repository access.
-   Index the repository.
-   Ask questions about the entire codebase.
-   Get grounded AI answers.
-   See exact file/line citations.
-   Click citations to view source code.
-   Ask follow-up questions while maintaining conversation context.
-   View previous conversations.
-   Create new conversations.
-   Re-index repositories incrementally after Git changes.
-   Understand callers, callees, imports, and dependencies.
-   Evaluate RAG quality.

------------------------------------------------------------------------

## 4. Authentication

Use **GitHub OAuth only**.

``` text
User
 ↓
Continue with GitHub
 ↓
GitHub OAuth
 ↓
Authorization
 ↓
CodeLens Dashboard
```

Do NOT implement:

-   Email/password registration
-   Email/password login
-   Separate CodeLens passwords

Store/use:

-   GitHub ID
-   Username
-   Avatar
-   Authorized repository information

------------------------------------------------------------------------

## 5. Repository Management

### 5.1 Repository List

After login, show **My Repositories**.

Each repository should display:

-   Name
-   Owner
-   Public/private status
-   Default branch
-   Index status
-   Last indexed commit
-   Last indexed time
-   File count
-   Symbol count

### 5.2 Add Repository by URL

Allow the user to enter a GitHub repository URL.

Examples:

-   Public repository → allow indexing.
-   Private repository + user has access → allow indexing.
-   Private repository + user does not have access → reject.

Never bypass GitHub permissions.

------------------------------------------------------------------------

## 6. Repository Indexing

Pipeline:

``` text
GitHub Repository
       ↓
Clone / Fetch
       ↓
Apply ignore rules
       ↓
Language detection
       ↓
Tree-sitter parsing
       ↓
AST / symbols
       ↓
Structure-aware chunking
       ↓
Metadata extraction
       ↓
OpenAI embeddings
       ↓
Qdrant
       ↓
Sparse/keyword index
       ↓
Dependency information
       ↓
Repository ready
```

The UI should show indexing progress:

``` text
Indexing repository...

Files scanned: 842
Symbols found: 4,231
Chunks created: 7,842

████████████████░░ 89%
```

------------------------------------------------------------------------

## 7. File Filtering

Ignore unnecessary/generated files, including:

``` text
.git/
node_modules/
dist/
build/
coverage/
__pycache__/
.venv/
generated files
binary files
minified files
```

Use `.gitignore` where appropriate.

------------------------------------------------------------------------

## 8. Code Parsing

Use **Tree-sitter**.

Extract:

-   Functions
-   Classes
-   Methods
-   Imports
-   Exports
-   Function calls
-   Symbols
-   Line numbers
-   Language

Initial language support:

-   JavaScript
-   TypeScript
-   Python
-   Java
-   C++
-   C
-   Go

More languages may be added later.

------------------------------------------------------------------------

## 9. Structure-Aware Chunking

Do not rely only on fixed token chunks.

Prefer code structure:

``` text
Class
 ├── Method
 ├── Method
 └── Method
```

Every chunk should store metadata such as:

``` json
{
  "repository_id": "...",
  "file_path": "src/auth/authService.js",
  "symbol_name": "generateToken",
  "symbol_type": "function",
  "language": "javascript",
  "start_line": 20,
  "end_line": 38,
  "commit_sha": "...",
  "imports": []
}
```

For large classes, use hierarchical chunks where useful:

``` text
Class Summary
      ↓
Methods
      ↓
Implementation details
```

------------------------------------------------------------------------

## 10. Code Enrichment

Optionally generate a short natural-language description for each code
unit.

Example:

``` text
generateToken()
→ Generates a JWT for an authenticated user.
```

Store the description alongside the code representation to improve
plain-English retrieval.

------------------------------------------------------------------------

## 11. Embeddings

Use **OpenAI Embeddings**.

Create an abstraction:

``` text
EmbeddingService
       │
       └── OpenAIEmbeddingProvider
```

The embedding provider should be swappable later for experimentation/A-B
testing.

------------------------------------------------------------------------

## 12. Vector Database

Use **Qdrant**.

Store:

-   Dense embeddings
-   Sparse/keyword representation
-   Code chunks
-   Metadata/payload
-   Repository ID
-   File path
-   Symbol
-   Line range
-   Commit SHA

------------------------------------------------------------------------

## 13. Hybrid Retrieval

Use both semantic and exact/lexical retrieval.

``` text
              Query
                ↓
       ┌────────┴────────┐
       ↓                 ↓
 Dense Retrieval    Sparse Retrieval
       ↓                 ↓
       └────────┬────────┘
                ↓
               RRF
                ↓
        Candidate Results
```

Dense retrieval handles semantic meaning.

Sparse retrieval handles exact identifiers such as:

-   `generateToken`
-   `authMiddleware`
-   `UserController`

Qdrant should be used for the hybrid retrieval/RRF workflow where
practical.

------------------------------------------------------------------------

## 14. Query Processing and Rewriting

Every question can pass through:

``` text
User Query
    ↓
Query Understanding
    ↓
Query Rewrite (when useful)
    ↓
Repository/Conversation Context
    ↓
Hybrid Retrieval
    ↓
Reranking
    ↓
Context Assembly
    ↓
OpenAI LLM
```

Example:

``` text
User:
Where is it called?

Previous context:
generateToken()

Rewritten query:
Where is generateToken() called in the repository?
```

Use LangChain/LangGraph where useful for this workflow.

------------------------------------------------------------------------

## 15. Reranking

Initial retrieval can return many candidates.

Pipeline:

``` text
Hybrid Retrieval
      ↓
Top 50
      ↓
Cross-Encoder Reranker
      ↓
Top 8–12
      ↓
Context Assembly
```

Only the most relevant context should be sent to the LLM.

------------------------------------------------------------------------

## 16. Dependency / Code Graph

Extract and maintain relationships such as:

-   Caller
-   Callee
-   Imports
-   Exports
-   Class relationships
-   Types
-   Dependencies

Example:

``` text
checkout()
    ↓
calculatePrice()
    ↓
calculateTax()
```

Support questions such as:

-   Who calls this function?
-   What does this function depend on?
-   What could break if I change this function?

------------------------------------------------------------------------

## 17. OpenAI Generation

Use **OpenAI** for final answer generation.

The LLM receives:

``` text
User Question
+
Relevant Conversation Context
+
Retrieved Code
+
Dependency Information
+
Repository Metadata
```

It generates:

``` text
Answer
+
Citations
```

------------------------------------------------------------------------

## 18. Citation System

Every important codebase claim should include a citation whenever
possible.

Format:

``` text
src/auth/authService.js:20-38
```

Example:

> JWT generation happens inside `generateToken()`.

Source:

``` text
src/auth/authService.js:20-38
```

------------------------------------------------------------------------

## 19. Clickable Citations and Code Viewer

When the user clicks a citation such as:

``` text
src/auth/authService.js:20-38
```

open the source code at the exact location:

``` text
src/auth/authService.js

20 │ function generateToken(user) {
21 │
22 │   const payload = ...
23 │   return jwt.sign(...)
24 │ }
```

Relevant lines should be highlighted.

------------------------------------------------------------------------

## 20. Hallucination Protection

If evidence is insufficient:

``` text
Retrieval
   ↓
Low confidence
   ↓
Do not guess
```

Return something like:

> I couldn't find sufficient evidence in this repository to answer this
> confidently.

Never invent:

-   Files
-   Functions
-   Classes
-   Dependencies
-   Line numbers
-   Repository behavior

------------------------------------------------------------------------

## 21. Conversational Chat

The UI should feel like a ChatGPT-style coding assistant.

Example:

``` text
User:
Where is authentication handled?

AI:
authMiddleware() handles authentication.

User:
What calls it?

AI:
Three functions call authMiddleware()...
```

The system must resolve references such as:

> "it"

to the correct entity from conversation context.

------------------------------------------------------------------------

## 22. Conversation Memory

Use two levels of memory.

### Short-Term Memory

Keep recent messages available to the current workflow.

### Long-Term Conversation Context

Summarize older messages into a compact conversation summary.

Architecture:

``` text
Recent Messages
      +
Conversation Summary
      +
Current Query
      +
Repository Retrieval
      ↓
OpenAI
```

LangGraph can be used to manage stateful conversation workflows.

Do not send the entire conversation indefinitely if it causes
unnecessary token usage.

------------------------------------------------------------------------

## 23. Chat History

Provide a ChatGPT-style sidebar:

``` text
CodeLens

+ New Chat

Today
 ├── Authentication flow
 ├── Payment architecture
 └── Database analysis

Yesterday
 ├── JWT implementation
 └── API structure
```

Each conversation stores:

-   Conversation ID
-   Repository ID
-   Messages
-   Conversation summary
-   Created time
-   Updated time

------------------------------------------------------------------------

## 24. New Chat

Provide:

``` text
+ New Chat
```

A new conversation starts while the user can keep the current repository
selected.

Example:

``` text
Repository: CodeSaga

+ New Chat
```

Each chat has its own conversation ID and history.

------------------------------------------------------------------------

## 25. Repository Dashboard

For each repository display:

``` text
Repository: CodeSaga

Files: 842
Symbols: 4,231
Chunks: 7,842

Current Commit:
abc123

Last Indexed:
Aug 17, 2026

Status:
✓ Up to date
```

Actions:

-   Open Chat
-   Browse Files
-   Re-index
-   Remove Repository

------------------------------------------------------------------------

## 26. Incremental Indexing

**Incremental indexing is a core project feature, not only future
scope.**

Do not rebuild the entire repository after every change.

Pipeline:

``` text
Git Push
   ↓
Detect new commit
   ↓
git diff
   ↓
Changed files
   ↓
Re-parse changed files
   ↓
Re-chunk
   ↓
Re-embed
   ↓
Update Qdrant
   ↓
Update dependency graph
```

Example:

``` text
Repository = 1,000 files
Changed = 5 files

Do NOT:
❌ Re-index 1,000 files

DO:
✓ Re-index 5 changed files
```

Handle:

-   Added files
-   Modified files
-   Deleted files
-   Renamed files where detectable

------------------------------------------------------------------------

## 27. Commit Versioning

Each indexed chunk should store:

-   `commit_sha`
-   `indexed_at`
-   `repository_id`

If the repository changed after the last indexing:

``` text
Current commit = abc129
Indexed commit = abc123
```

show:

> Repository has changed. Index is outdated.

Provide:

``` text
[ Update Index ]
```

------------------------------------------------------------------------

## 28. Git History

Support indexing/retrieval of:

-   Commit messages
-   Commit diffs
-   File history
-   Pull request descriptions

This can support questions such as:

> Why was this function introduced?

Issue/discussion integration can remain optional/future scope.

------------------------------------------------------------------------

## 29. Near-Duplicate Handling

Handle:

-   Boilerplate
-   Generated code
-   Duplicate chunks
-   Minified code

Use:

-   Content hashes
-   Duplicate detection
-   Filtering
-   Retrieval deduplication

------------------------------------------------------------------------

## 30. Context Management

Retrieved code can be very large.

Before sending context to OpenAI:

``` text
Retrieved Code
      ↓
Remove irrelevant content
      ↓
Keep relevant signatures
      ↓
Keep relevant implementations
      ↓
Keep necessary dependencies
      ↓
Fit context/token budget
      ↓
OpenAI
```

------------------------------------------------------------------------

# 31. LangChain Requirements

Use **LangChain** where it provides useful abstractions for:

-   Document handling
-   Prompt templates
-   OpenAI integration
-   Qdrant integration
-   Retrieval components
-   Reranking/retrieval pipelines
-   Structured output
-   Message history

Do not hide the entire application architecture behind LangChain.

The project should still explicitly control:

-   Retrieval
-   Ranking
-   Context assembly
-   Citation logic
-   Memory
-   Validation

------------------------------------------------------------------------

# 32. LangGraph Requirements

Use **LangGraph only where stateful/multi-step workflows benefit from
it**.

Potential workflow:

``` text
START
  ↓
Understand Query
  ↓
Need Rewrite?
 ├── YES → Rewrite Query
 └── NO
  ↓
Hybrid Retrieval
  ↓
Reranking
  ↓
Need Dependency Expansion?
 ├── YES → Graph Expansion
 └── NO
  ↓
Build Context
  ↓
Generate Answer
  ↓
Validate Citations
  ↓
Confidence Check
 ├── LOW → Refuse
 └── HIGH → Answer
  ↓
END
```

LangGraph can also manage:

-   Conversation state
-   Retrieval state
-   Query routing
-   Citation validation
-   Retry/recovery
-   Multi-step RAG workflows

Do not force LangGraph into simple CRUD/API operations.

------------------------------------------------------------------------

# 33. Frontend

Use:

-   React.js
-   JavaScript
-   Tailwind CSS
-   React Router
-   API client
-   Markdown renderer
-   Syntax highlighting
-   Code viewer
-   Streaming UI

Pages:

``` text
/login
/dashboard
/repositories
/repository/:id
/chat/:id
/settings
```

------------------------------------------------------------------------

# 34. Main UI

``` text
┌───────────────────────────────────────────────┐
│ CodeLens                         Repository ▼ │
├──────────────┬────────────────────────────────┤
│              │                                │
│ + New Chat   │  Where is authentication?     │
│              │                                │
│ Chats        │  Authentication is handled... │
│              │                                │
│ Today        │  Sources:                     │
│ Auth flow    │  auth.js:24-38                │
│ API design   │  middleware.js:10-29          │
│              │                                │
│ Repositories │  [Ask CodeLens...]             │
│ CodeSaga     │                                │
│ Backend      │                                │
└──────────────┴────────────────────────────────┘
```

------------------------------------------------------------------------

# 35. Backend

Use **FastAPI**.

Logical modules:

``` text
auth/
github/
repositories/
indexing/
parsing/
chunking/
embeddings/
retrieval/
reranking/
graph/
chat/
memory/
llm/
citations/
evaluation/
```

Initially these should be modules inside one FastAPI application, not
separate microservices.

------------------------------------------------------------------------

# 36. Database

## PostgreSQL

Application data tables:

``` text
users
repositories
repository_access
conversations
messages
conversation_summaries
indexing_jobs
repository_versions
files
symbols
```

## Qdrant

Store:

``` text
code chunks
embeddings
retrieval metadata
```

------------------------------------------------------------------------

# 37. Security

Required:

-   GitHub OAuth
-   Secure sessions/tokens
-   Repository authorization
-   User/repository ownership
-   Private repository protection
-   API key protection
-   Environment variables
-   No secrets in frontend
-   User-isolated retrieval
-   Secure GitHub token handling

Critical rule:

``` text
User A
 ↓
Only authorized repositories

User B
 ↓
Only authorized repositories
```

Never allow one user to retrieve another user's private repository data.

------------------------------------------------------------------------

# 38. Evaluation

Create a benchmark of **at least 50 questions**.

Example:

``` text
Question:
Where is authentication handled?

Expected:
src/auth/middleware.js
```

Measure:

### Retrieval

-   Recall@5
-   Recall@10
-   MRR

### Generation

-   Answer correctness
-   Relevance
-   Faithfulness

### Citations

-   Citation validity
-   Correct file
-   Correct line range

### Performance

-   P50 latency
-   P95 latency
-   Indexing time
-   Files/second

------------------------------------------------------------------------

# 39. Evaluation Dashboard

Example:

``` text
CodeLens Evaluation

Recall@10          89%
MRR                0.84
Citation Validity  94%

P50 Latency        1.8 sec
P95 Latency        3.7 sec

Indexing:
842 files
2m 14s
```

Only show actual measured values.

------------------------------------------------------------------------

# 40. Core Feature Checklist

## Authentication

-   [ ] GitHub OAuth
-   [ ] No email/password
-   [ ] Secure sessions

## Repository

-   [ ] List accessible repositories
-   [ ] Public repository support
-   [ ] Private repository support
-   [ ] Repository URL input
-   [ ] Access verification
-   [ ] Repository selection
-   [ ] Repository removal

## Indexing

-   [ ] File scanning
-   [ ] Ignore rules
-   [ ] Language detection
-   [ ] Tree-sitter
-   [ ] AST
-   [ ] Symbol extraction
-   [ ] Structure-aware chunks
-   [ ] Metadata
-   [ ] OpenAI embeddings
-   [ ] Qdrant
-   [ ] Commit SHA tracking

## RAG

-   [ ] Query understanding
-   [ ] Query rewriting
-   [ ] Dense retrieval
-   [ ] Sparse retrieval
-   [ ] Hybrid search
-   [ ] RRF
-   [ ] Reranking
-   [ ] Context assembly

## Code Intelligence

-   [ ] Caller detection
-   [ ] Callee detection
-   [ ] Import analysis
-   [ ] Dependency graph
-   [ ] Symbol resolution

## AI

-   [ ] OpenAI
-   [ ] Grounded answers
-   [ ] Citation generation
-   [ ] Citation validation
-   [ ] Confidence check
-   [ ] Refusal on insufficient evidence

## Chat

-   [ ] ChatGPT-style UI
-   [ ] New Chat
-   [ ] Chat history
-   [ ] Current conversation context
-   [ ] Conversation summary
-   [ ] Repository-specific conversations
-   [ ] Streaming

## Code Viewer

-   [ ] File tree
-   [ ] Syntax highlighting
-   [ ] Line numbers
-   [ ] Clickable citations
-   [ ] Line highlighting

## Updates

-   [ ] Git commit tracking
-   [ ] Git diff
-   [ ] Incremental indexing
-   [ ] Changed-file detection
-   [ ] Deleted-file handling
-   [ ] Stale-index detection

## Evaluation

-   [ ] 50+ benchmark questions
-   [ ] Recall@K
-   [ ] MRR
-   [ ] Citation validity
-   [ ] Answer correctness
-   [ ] P50/P95 latency

------------------------------------------------------------------------

# 41. Exact Build Phases

## PHASE 1 --- Project Foundation

Build:

``` text
React
+
FastAPI
+
PostgreSQL
+
Docker setup
+
Basic project structure
```

**Done when:** frontend and backend communicate successfully.

------------------------------------------------------------------------

## PHASE 2 --- GitHub Authentication

Build:

``` text
GitHub OAuth
 ↓
Login
 ↓
User profile
 ↓
Dashboard
```

**Done when:** user can login/logout using GitHub.

------------------------------------------------------------------------

## PHASE 3 --- Repository Management

Build:

``` text
GitHub API
 ↓
List repositories
 ↓
Select repository
 ↓
Repository URL
 ↓
Access verification
```

**Done when:** user can select an authorized repository.

------------------------------------------------------------------------

## PHASE 4 --- Basic Repository Ingestion

Build:

``` text
Clone repo
 ↓
Scan files
 ↓
Ignore unnecessary files
 ↓
Extract code
```

Initially do not build AST.

**Done when:** CodeLens can ingest a real mid-sized repository.

------------------------------------------------------------------------

## PHASE 5 --- Basic RAG

Build the simplest working RAG:

``` text
Code
 ↓
Basic chunks
 ↓
OpenAI embeddings
 ↓
Qdrant
 ↓
Vector search
 ↓
OpenAI
 ↓
Answer
```

**Done when:** a question such as "Where is authentication implemented?"
gets a useful answer.

This is the first working MVP.

------------------------------------------------------------------------

## PHASE 6 --- Chat UI

Build:

-   Chat screen
-   Message bubbles
-   Streaming
-   Repository selector
-   Loading/error states

**Done when:** user can have a basic conversation about the repository.

------------------------------------------------------------------------

## PHASE 7 --- Code Citations

Add:

``` text
file
symbol
start_line
end_line
```

Then:

``` text
Answer
 ↓
Citation
 ↓
Code viewer
 ↓
Exact line highlight
```

**Done when:** user can verify AI answers against real code.

------------------------------------------------------------------------

## PHASE 8 --- Conversational Memory

Implement:

``` text
Message storage
+
Recent messages
+
Conversation summary
```

Add:

-   New Chat
-   Chat History
-   Conversation persistence
-   Current-chat memory

Use LangGraph if it simplifies the stateful conversation workflow.

**Done when:**

> Where is authentication?

followed by:

> Who calls it?

works correctly.

------------------------------------------------------------------------

## PHASE 9 --- AST / Code-Aware Chunking

Replace basic chunks.

Build:

``` text
Tree-sitter
 ↓
AST
 ↓
Functions
Classes
Methods
Imports
Calls
 ↓
Structure-aware chunks
```

**Done when:** function/class boundaries are preserved.

------------------------------------------------------------------------

## PHASE 10 --- Hybrid Retrieval

Add:

``` text
Dense Search
+
Sparse Search
 ↓
RRF
```

**Done when:** exact identifier queries such as:

> Where is `generateToken()` called?

reliably retrieve relevant exact matches.

------------------------------------------------------------------------

## PHASE 11 --- Reranking

Build:

``` text
Hybrid Search
 ↓
Top 50
 ↓
Reranker
 ↓
Top 8–12
```

**Done when:** retrieval quality improves measurably.

------------------------------------------------------------------------

## PHASE 12 --- LangGraph Retrieval Workflow

Use LangGraph for the multi-step workflow:

``` text
Query
 ↓
Classify
 ↓
Rewrite?
 ↓
Hybrid Retrieval
 ↓
Rerank
 ↓
Dependency Expansion?
 ↓
Context Assembly
 ↓
Generate
 ↓
Citation Validation
 ↓
Confidence Check
 ↓
Answer / Refuse
```

**Done when:** complex questions can follow different retrieval paths.

------------------------------------------------------------------------

## PHASE 13 --- Dependency Graph

Build:

-   Callers
-   Callees
-   Imports
-   Types
-   Dependencies

Support:

> Who calls this function?

> What does this function depend on?

> What could break if I change it?

------------------------------------------------------------------------

## PHASE 14 --- Strict Citation + Hallucination Control

Implement:

``` text
Claim
 ↓
Citation
 ↓
Validate citation
 ↓
Evidence sufficient?
 ├── YES → Answer
 └── NO → Refuse
```

**Done when:** unsupported repository claims are rejected.

------------------------------------------------------------------------

## PHASE 15 --- Evaluation System

Create **50+ manually verified questions**.

Compare retrieval before/after:

-   AST
-   Hybrid search
-   Reranking

Measure:

-   Recall@10
-   MRR
-   Citation accuracy
-   Answer correctness
-   Latency

**Done when:** every major retrieval improvement has measurable
evidence.

------------------------------------------------------------------------

## PHASE 16 --- Incremental Indexing

Implement:

``` text
GitHub
 ↓
New commit
 ↓
Detect commit
 ↓
git diff
 ↓
Changed files
 ↓
Reparse
 ↓
Rechunk
 ↓
Re-embed
 ↓
Update Qdrant
 ↓
Update graph
```

Handle:

-   Added files
-   Modified files
-   Deleted files
-   Renamed files where detectable

**Done when:** changing a few files does not trigger a full repository
rebuild.

------------------------------------------------------------------------

## PHASE 17 --- Git History

Add:

-   Commit messages
-   Commit diffs
-   File history
-   Pull request descriptions

Potential question:

> Why was this function introduced?

------------------------------------------------------------------------

## PHASE 18 --- Dashboard + Polish

Add:

-   Repository statistics
-   Index status
-   Last indexed commit
-   Chat statistics
-   Error handling
-   Empty states
-   Loading states
-   Search
-   Settings
-   Responsive UI
-   Security hardening

------------------------------------------------------------------------

## PHASE 19 --- Deployment

Deploy:

``` text
React frontend
FastAPI backend
PostgreSQL
Qdrant
```

Use Docker.

Add:

-   Environment variables
-   Logging
-   Monitoring
-   Production error handling

------------------------------------------------------------------------

# 42. Future / Stretch Features

Only after the core project works:

## Multi-Repository Intelligence

Search across:

``` text
Frontend
   ↕
Backend
   ↕
Auth Service
   ↕
Payment Service
```

with cross-repository dependencies.

## Blast Radius

Question:

> What breaks if I change `calculatePrice()`?

Example output:

``` text
calculatePrice()
      ↓
12 dependent functions
      ↓
5 files
      ↓
3 modules
```

## Onboarding Mode

Question:

> I'm new to this repository. What should I read first?

Generate:

``` text
1. README
2. Project architecture
3. Authentication
4. Database
5. APIs
6. Core business logic
7. Tests
```

## GitHub Issues / Discussions

Use repository issues, discussions, and related history to improve "why"
questions.

------------------------------------------------------------------------

# 43. Final Technology Stack

## Frontend

-   React.js
-   JavaScript
-   Tailwind CSS
-   React Router
-   Markdown renderer
-   Syntax highlighting
-   Code viewer

## Backend

-   Python
-   FastAPI
-   Pydantic

## AI

-   OpenAI LLM
-   OpenAI Embeddings

## RAG

-   LangChain
-   LangGraph
-   Tree-sitter
-   Qdrant
-   Dense retrieval
-   Sparse retrieval
-   Hybrid search
-   RRF
-   Cross-encoder reranking

## Database

-   PostgreSQL
-   Qdrant

## Authentication

-   GitHub OAuth

## DevOps

-   Git
-   GitHub
-   Docker
-   Environment variables

------------------------------------------------------------------------

# 44. Final Architecture

``` text
                         CODELENS
                            │
                ┌───────────┴───────────┐
                │                       │
           React / JS               GitHub OAuth
                │                       │
                └───────────┬───────────┘
                            ↓
                         FastAPI
                            │
          ┌─────────────────┼──────────────────┐
          ↓                 ↓                  ↓
      GitHub API        Chat/Memory       Repository
          │                 │               Indexer
          │                 │                  │
          │                 │              Tree-sitter
          │                 │                  ↓
          │                 │               AST/Chunks
          │                 │                  ↓
          │                 │              Embeddings
          │                 │                  ↓
          │                 │                Qdrant
          │                 │                  │
          └─────────────────┼──────────────────┘
                            ↓
                   LangGraph Workflow
                            ↓
                   Hybrid Retrieval
                            ↓
                           RRF
                            ↓
                        Reranker
                            ↓
                    Dependency Graph
                            ↓
                     Context Builder
                            ↓
                       OpenAI LLM
                            ↓
                 Answer + Citations
                            ↓
                      Code Viewer
```

------------------------------------------------------------------------

# 45. Development Rule

**Do not implement all features at once.**

Follow this exact progression:

``` text
Foundation
    ↓
GitHub Login
    ↓
Repository Management
    ↓
Basic RAG
    ↓
Chat UI
    ↓
Citations
    ↓
Memory + Chat History
    ↓
AST
    ↓
Hybrid Search
    ↓
Reranking
    ↓
LangGraph Workflow
    ↓
Dependency Graph
    ↓
Evaluation
    ↓
Incremental Indexing
    ↓
Git History
    ↓
Polish + Deployment
    ↓
Stretch Features
```

### MVP

The first usable version must be:

**GitHub Login → Select Repository → Index → Chat → Basic RAG →
Citations → Code Viewer → Chat History/Memory**

Every later phase should improve the same product rather than creating
disconnected features.

------------------------------------------------------------------------

## Implementation Principle

The project should be **modular, understandable, and
production-oriented**.

Do not add a technology just to make the project look advanced.

Every component must have a clear purpose:

-   **React** → user interface
-   **FastAPI** → backend/API
-   **GitHub OAuth** → authentication and repository authorization
-   **Tree-sitter** → code parsing
-   **OpenAI** → embeddings + answer generation
-   **Qdrant** → vector/hybrid retrieval
-   **LangChain** → reusable LLM/RAG components
-   **LangGraph** → stateful multi-step AI workflows
-   **PostgreSQL** → users, repositories, chats, indexing metadata
-   **Docker** → reproducible deployment

The implementation should prioritize correctness, security, retrieval
quality, citation validity, and measurable evaluation over unnecessary
complexity.
