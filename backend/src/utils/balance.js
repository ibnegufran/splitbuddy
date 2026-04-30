const buildMemberNameMap = (members) => {
  const memberMap = {};
  members.forEach((member) => {
    memberMap[member._id.toString()] = member.name;
  });
  return memberMap;
};

const computeBalances = (members, transactions) => {
  const net = {};
  const memberNameMap = buildMemberNameMap(members);

  members.forEach((member) => {
    net[member._id.toString()] = 0;
  });

  transactions.forEach((tx) => {
    const from = tx.from.toString();
    const to = tx.to.toString();
    const amount = Number(tx.amount || 0);

    if (tx.type === "expense") {
      net[from] -= amount;
      net[to] += amount;
      return;
    }

    net[from] += amount;
    net[to] -= amount;
  });

  const debtors = [];
  const creditors = [];

  Object.entries(net).forEach(([memberId, amount]) => {
    const rounded = Number(amount.toFixed(2));
    if (rounded < 0) {
      debtors.push({ memberId, amount: Math.abs(rounded) });
    } else if (rounded > 0) {
      creditors.push({ memberId, amount: rounded });
    }
  });

  const balances = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);
    const rounded = Number(settledAmount.toFixed(2));

    if (rounded > 0) {
      balances.push({
        from: debtor.memberId,
        fromName: memberNameMap[debtor.memberId],
        to: creditor.memberId,
        toName: memberNameMap[creditor.memberId],
        amount: rounded
      });
    }

    debtor.amount = Number((debtor.amount - settledAmount).toFixed(2));
    creditor.amount = Number((creditor.amount - settledAmount).toFixed(2));

    if (debtor.amount <= 0) i += 1;
    if (creditor.amount <= 0) j += 1;
  }

  return balances;
};

module.exports = {
  computeBalances,
  buildMemberNameMap
};
