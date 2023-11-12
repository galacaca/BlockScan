import "./txn.css";

export function Transactions(props) {
  const { transactions, page, onPageChange, totalTransactions } = props;

  if (!transactions || transactions.length === 0) {
    return null;
  }

  const transactionsPerPage = 10;
  const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
  const startIndex = (page - 1) * transactionsPerPage;
  const endIndex = Math.min(startIndex + transactionsPerPage, totalTransactions);

  const displayTransactions = transactions.slice(startIndex, endIndex);

  return (
    <div className="transactions-table">
      <h3 className="transactions-lastblock">Transactions in the Last Block</h3>
      <table>
        <thead>
          <tr>
            <th>Hash</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody>
          {displayTransactions.map((tx, i) => (
            <tr key={`tx-${i}`}>
              <td>{tx.hash}</td>
              <td>{tx.from}</td>
              <td>{tx.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => onPageChange(1)}>First</button>
        <button onClick={() => onPageChange(page - 1)}>Previous</button>
        <span>{`Page ${page} of ${totalPages}`}</span>
        <button onClick={() => onPageChange(page + 1)}>Next</button>
        <button onClick={() => onPageChange(totalPages)}>Last</button>
      </div>
    </div>
  );
}