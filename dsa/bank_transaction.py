import argparse
from collections import defaultdict
from functools import lru_cache


class Node:
    def __init__(self, account_id: str):
        self.account_id = account_id
        self.money_sent = 0

    def __repr__(self):
        return f"Node({self.account_id})"


class Graph:
    def __init__(self):
        self._nodes: dict[str, Node] = {}
        self._adj: dict[str, list[str]] = defaultdict(list)

    def add_transaction(self, from_id: str, to_id: str, amount: int):
        if from_id not in self._nodes:
            self._nodes[from_id] = Node(from_id)
        if to_id not in self._nodes:
            self._nodes[to_id] = Node(to_id)
        self._nodes[from_id].money_sent += amount
        self._adj[from_id].append(to_id)

    def accounts_sorted(self) -> list[str]:
        return sorted(self._nodes)

    def money_from(self, account_id: str) -> int:
        node = self._nodes.get(account_id)
        return node.money_sent if node else 0

    def has_cycle(self, start: str, k: int) -> bool:
        frozen_adj = {node: tuple(neighbors) for node, neighbors in self._adj.items()}

        @lru_cache(maxsize=None)
        def dfs(node: str, steps: int) -> bool:
            if steps == 0:
                return node == start
            for nxt in frozen_adj.get(node, ()):
                if dfs(nxt, steps - 1):
                    return True
            return False

        return dfs(start, k)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_file")
    parser.add_argument("output_file")
    args = parser.parse_args()

    with open(args.input_file, encoding="utf-8") as f:
        lines = iter(f.read().splitlines())

    g = Graph()
    total_count = 0
    total_money = 0

    for line in lines:
        line = line.strip()
        if line == "#":
            break
        if not line:
            continue
        from_acc, to_acc, money, _time, _atm = line.split()
        total_count += 1
        total_money += int(money)
        g.add_transaction(from_acc, to_acc, int(money))

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
            out.append(" ".join(g.accounts_sorted()))
        elif line.startswith("?total_money_transaction_from "):
            account = line[30:]
            out.append(str(g.money_from(account)))
        elif line.startswith("?inspect_cycle "):
            parts = line[15:].split()
            account, k = parts[0], int(parts[1])
            out.append("1" if g.has_cycle(account, k) else "0")

    with open(args.output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")

if __name__ == "__main__":
    main()

#python bank_transaction.py testcase-miniproject/testcase-miniproject/3/1-input.txt testcase-miniproject/testcase-miniproject/3/1-output.txt
