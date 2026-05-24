import sys
from collections import defaultdict
from functools import lru_cache

def main():
    input_data = sys.stdin.buffer.read().decode()
    lines = iter(input_data.splitlines())

    total_count = 0
    total_money = 0
    accounts = set()
    money_from = defaultdict(int)
    graph = defaultdict(list)

    for line in lines:
        line = line.strip()
        if line == "#":
            break
        if not line:
            continue
        from_acc, to_acc, money, _time, _atm = line.split()
        total_count += 1
        total_money += int(money)
        accounts.add(from_acc)
        accounts.add(to_acc)
        money_from[from_acc] += int(money)
        graph[from_acc].append(to_acc)

    sorted_accounts = sorted(accounts)

    # Freeze graph for lru_cache (tuples are hashable)
    frozen_graph = {k: tuple(v) for k, v in graph.items()}

    def inspect_cycle(start, k):
        @lru_cache(maxsize=None)
        def dfs(node, steps):
            if steps == 0:
                return node == start
            for nxt in frozen_graph.get(node, ()):
                if dfs(nxt, steps - 1):
                    return True
            return False
        return 1 if dfs(start, k) else 0

    out = []
    for line in lines:
        line = line.strip()
        if line == "#":
            break
        if not line:
            continue

        if line == "?number_transactions":
            out.append(str(total_count))
        elif line == "?total_money_transaction":
            out.append(str(total_money))
        elif line == "?list_sorted_accounts":
            out.append(" ".join(sorted_accounts))
        elif line.startswith("?total_money_transaction_from "):
            account = line[30:]
            out.append(str(money_from.get(account, 0)))
        elif line.startswith("?inspect_cycle "):
            parts = line[15:].split()
            account, k = parts[0], int(parts[1])
            out.append(str(inspect_cycle(account, k)))

    print("\n".join(out))

main()
