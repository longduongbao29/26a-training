import argparse
from collections import defaultdict


class Node:
    def __init__(self, account_id: str):
        self.account_id = account_id
        self.money_sent = 0

    def __repr__(self):
        return f"Node({self.account_id})"

    def __hash__(self):
        return hash(self.account_id)

    def __eq__(self, other):
        return isinstance(other, Node) and self.account_id == other.account_id


class Graph:
    def __init__(self):
        self._nodes: dict[str, Node] = {}
        self._adj: dict[Node, list[Node]] = defaultdict(list)
        self.total_money = 0
        self.total_transactions = 0

    def _get_or_create(self, account_id: str) -> Node:
        if account_id not in self._nodes:
            self._nodes[account_id] = Node(account_id)
        return self._nodes[account_id]

    def add_transaction(self, from_id: str, to_id: str, amount: int):
        from_node = self._get_or_create(from_id)
        to_node   = self._get_or_create(to_id)
        from_node.money_sent += amount
        self._adj[from_node].append(to_node)
        self.total_money += amount
        self.total_transactions += 1

    def accounts_sorted(self) -> list[str]:
        return sorted(self._nodes)

    def money_from(self, account_id: str) -> int:
        node = self._nodes.get(account_id)
        return node.money_sent if node else 0

    def has_cycle(self, start: str, k: int) -> bool:
        start_node = self._nodes.get(start)
        if not start_node:
            return False

        frozen_adj = {node: tuple(neighbors) for node, neighbors in self._adj.items()}
        memo: dict[tuple[Node, int], bool] = {}

        def dfs(node: Node, steps: int) -> bool:
            if steps == 0:
                return node == start_node
            if (node, steps) in memo:
                return memo[(node, steps)]
            for nxt in frozen_adj.get(node, ()):
                if dfs(nxt, steps - 1):
                    memo[(node, steps)] = True
                    return True
            memo[(node, steps)] = False
            return False

        return dfs(start_node, k)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_file")
    parser.add_argument("output_file")
    args = parser.parse_args()

    with open(args.input_file, encoding="utf-8") as f:
        lines = iter(f.read().splitlines())

    g = Graph()

    for line in lines:
        line = line.strip()
        if line == "#":
            break
        if not line:
            continue
        from_acc, to_acc, money, _time, _atm = line.split()
        g.add_transaction(from_acc, to_acc, int(money))

    out = []
    for line in lines:
        line = line.strip()
        if line == "#":
            break
        if not line:
            continue

        if line == "?number_transactions":
            out.append(str(g.total_transactions))
        elif line == "?total_money_transaction":
            out.append(str(g.total_money))
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
