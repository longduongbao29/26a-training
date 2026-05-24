# Bank Transaction — Algorithm

## Problem Summary

Given a sequence of bank transactions, each with format:

```
<from_account> <to_account> <money> <time_point> <atm>
```

Answer the following queries:

| Query | Description |
|-------|-------------|
| `?number_transactions` | Total number of transactions |
| `?total_money_transaction` | Sum of all money amounts |
| `?list_sorted_accounts` | Sorted (alphabetical) unique accounts (both sender and receiver) |
| `?total_money_transaction_from <account>` | Total money sent *from* an account |
| `?inspect_cycle <account> k` | Return `1` if a transaction cycle of length `k` starting from `<account>` exists, else `0` |

A **transaction cycle of length k** starting from `a1` is a sequence `a1, a2, ..., ak` such that transactions exist: `a1→a2`, `a2→a3`, ..., `ak→a1`.

---

## Data Structures

| Structure | Type | Purpose |
|-----------|------|---------|
| `total_count` | `long long` | Running count of transactions |
| `total_money` | `long long` | Running sum of money |
| `accounts` | `set<string>` | Unique accounts, kept sorted automatically |
| `money_from` | `unordered_map<string, long long>` | Total money sent per sender account |
| `graph` | `unordered_map<string, vector<string>>` | Directed adjacency list for cycle detection |

All structures are populated in a single O(N) pass over the input.

---

## Query Algorithms

### `?number_transactions`
Return `total_count`. **O(1)**.

### `?total_money_transaction`
Return `total_money`. **O(1)**.

### `?list_sorted_accounts`
Iterate over `accounts` (a sorted `std::set`) and print space-separated. **O(A)** where A = number of unique accounts.

### `?total_money_transaction_from <account>`
Lookup `money_from[account]`. Return `0` if not found. **O(1)** average.

### `?inspect_cycle <account> k`

This is a reachability problem on the directed transaction graph:

> Does there exist a path of exactly `k` edges starting and ending at `<account>`?

**Algorithm: DFS with memoization on `(node, remaining_steps)`**

```
dfs(node, steps, target):
    if steps == 0:
        return node == target
    if (node, steps) in memo:
        return memo[(node, steps)]
    for each neighbor v of node in graph:
        if dfs(v, steps - 1, target):
            memo[(node, steps)] = true
            return true
    memo[(node, steps)] = false
    return false

answer = dfs(account, k, account)
```

**Why memoization is correct here:**
- `steps` strictly decreases at each recursive call — no infinite recursion even when the graph has cycles.
- `dfs(node, steps)` asks: *"can I reach `target` from `node` in exactly `steps` hops?"* — this depends only on `(node, steps)`, not on the path taken to arrive at `node`, so memo entries are reusable across different paths.

**Complexity:** O(V × k) states, each computed once → **O(V × k)** time per query, where V = number of unique accounts.

---

## Input/Output

**Input format:**
```
<transaction1>
<transaction2>
...
#
<query1>
<query2>
...
#
```

**Output:** One line per query with its result.

---

## Example Walkthrough

**Input transactions (9 total):**
```
T000010010 → T000010020  money=1000
T000010010 → T000010030  money=2000
T000010010 → T000010040  money=1500
T000010020 → T000010030  money=3000
T000010030 → T000010010  money=4000
T000010040 → T000010010  money=2000
T000010020 → T000010040  money=3000
T000010040 → T000010030  money=2000
T000010040 → T000010030  money=1000
```

**Query results:**

| Query | Answer | Explanation |
|-------|--------|-------------|
| `?number_transactions` | `9` | 9 lines of data |
| `?total_money_transaction` | `19500` | Sum of all amounts |
| `?list_sorted_accounts` | `T000010010 T000010020 T000010030 T000010040` | 4 unique accounts sorted |
| `?total_money_transaction_from T000010010` | `4500` | 1000+2000+1500 |
| `?inspect_cycle T000010010 3` | `1` | Cycle: T000010010→T000010020→T000010030→T000010010 ✓ |
