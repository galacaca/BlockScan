import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Alchemy } from "alchemy-sdk";

function DetailedView() {
  const { address } = useParams();
  const [accountBalance, setAccountBalance] = useState(null);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const alchemy = new Alchemy({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY });

    async function fetchAccountBalance() {
      try {
       // const response = await alchemy.core.getBalance(address, "latest");
        //const accountBalance = parseInt(response._hex, 16);
        //setAccountBalance(accountBalance);
        setAccountBalance(10);
      } catch (error) {
        console.error("Error fetching account balance:", error);
      }
    }

    async function fetchTokenBalances() {
      try {
        const response = await alchemy.core.getTokenBalances(address);
        setTokenBalances(response.tokenBalances);
      } catch (error) {
        console.error("Error fetching token balances:", error);
      }
    }

    async function fetchTransactions() {
      try {
        const response = await alchemy.core.getAssetTransfers({
          fromAddress: address,
          limit: 10, // Limit to last 10 transactions
        });
        setTransactions(response.transfers);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }

    fetchAccountBalance();
    fetchTokenBalances();
    fetchTransactions();
  }, [address]);

  return (
    <div className="detailed-view">
      <Link to="/">Back to Main Page</Link>
      <h1>Address: {address}</h1>
      <h2>Account Balance: {accountBalance}</h2>

      <div className="token-balances">
        <h2>Token Balances:</h2>
        {tokenBalances.map((token, index) => (
          <div key={index}>
            <p>Contract Address: {token.contractAddress}</p>
            <p>Token Balance: {parseInt(token.tokenBalance, 16)}</p>
          </div>
        ))}
      </div>

      <div className="transaction-history">
        <h2>Transaction History:</h2>
        <table>
          <thead>
            <tr>
              <th>From Address</th>
              <th>To Address</th>
              <th>Hash</th>
              <th>Value</th>
              <th>Asset</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.from}</td>
                <td>{transaction.to}</td>
                <td>{transaction.hash}</td>
                <td>{transaction.value}</td>
                <td>{transaction.asset}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DetailedView;
