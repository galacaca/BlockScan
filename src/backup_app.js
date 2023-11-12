import React, { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk"; // Import Alchemy and Network
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import DetailedView from "./DetailedView";
import "./App.css";
import { Transactions } from "./Transactions";
import { getNFTSales } from "./NftSalesService"; // Import the NFT sales service
import { formatEther } from 'ethers';

const { Utils } = require("alchemy-sdk");






function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [timestamp, setTimestamp] = useState();
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nftSales, setNftSales] = useState([]);
  const [searchAddress, setSearchAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [tokenBalances, setTokenBalances] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);


  const [c1urrentPage, setC1urrentPage] = useState(0);
  const pageSize = 5;
  const totalPages = Math.ceil(tokenBalances.length / pageSize);
  const getCurrentPageTokens = () => {
    return tokenBalances.slice(c1urrentPage * pageSize, (c1urrentPage + 1) * pageSize);
  };

  const goToFirstPage = () => setC1urrentPage(0);
  const goToPreviousPage = () => setC1urrentPage(current => Math.max(0, current - 1));
  const goToNextPage = () => setC1urrentPage(current => Math.min(totalPages - 1, current + 1));
  const goToLastPage = () => setC1urrentPage(totalPages - 1);

  const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY, // Ensure this is set in your environment variables
    network: Network.ETH_MAINNET,
  };

  const alchemy = new Alchemy(settings); // Initialize Alchemy with your settings

  async function fetchRecentTransactions(address) {
    try {
      // Fetch transactions sent by the address
      const sentResponse = await alchemy.core.getAssetTransfers({
        fromBlock: '0x0',
        fromAddress: address,
        excludeZeroValue: true,
        category:['external', 'internal', 'erc20', 'erc721', 'erc1155'],
        maxCount: 50,
      });
  
      // Fetch transactions received by the address
      const receivedResponse = await alchemy.core.getAssetTransfers({
        fromBlock: '0x0',
        toAddress: address,
        excludeZeroValue: true,
        category:['external', 'internal', 'erc20', 'erc721', 'erc1155'],
        maxCount: 50,
      });
      console.log("recent",receivedResponse);
      // Combine and sort the transactions
      const allTransactions = [...sentResponse.transfers, ...receivedResponse.transfers];
      allTransactions.sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));
 
      // Slice to get the last ten most recent transactions
      return allTransactions.slice(0, 10);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      return [];
    }
  }


  async function fetchTokenBalances(address) {
    try {
      const tokenBalancesResponse = await alchemy.core.getTokenBalances(address);
      const tokenBalances = tokenBalancesResponse.tokenBalances;
  
      const tokenDataPromises = tokenBalances
      .filter(token => parseInt(token.tokenBalance) > 0) // Filter out tokens with a balance of 0
      .map(async token => {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        return {
          contractAddress: token.contractAddress,
          tokenBalance: token.tokenBalance,
          name: metadata.name,
          symbol: metadata.symbol
        };
      });
  
      return await Promise.all(tokenDataPromises);
    } catch (error) {
      console.error("Error fetching token balances and metadata:", error);
      return [];
    }
  }

  useEffect(() => {
    alchemy.core.getBlockNumber().then(setBlockNumber);
  }, []);

  useEffect(() => {
    if (blockNumber) {
      alchemy.core.getBlockWithTransactions(blockNumber).then(block => {
        setTimestamp(block.timestamp);
        setTransactions(block.transactions);
      });
    }
  }, [blockNumber]);

  useEffect(() => {
    if (blockNumber) {
      getNFTSales(blockNumber).then(setNftSales);
    }
  }, [blockNumber]);

  const handleAddressSearch = async () => {
    try {
      const formattedAddress = searchAddress.startsWith('0x') ? searchAddress.substring(2) : searchAddress;

      const recentTrans = await fetchRecentTransactions(formattedAddress);
      setRecentTransactions(recentTrans);
      const balanceResult = await alchemy.core.getBalance(formattedAddress);
      //const balanceInWei = parseInt(balanceResult , 16);
      //const balanceETH = Utils.formatUnits(balanceInWei, "ether"); 
      console.log("result",balanceResult);
      setBalance(formatEther(balanceResult._hex)); // Convert balance to string and update state
      const tokens = await fetchTokenBalances(formattedAddress);
      setTokenBalances(tokens);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error fetching balance"); // Handle error
    }
  };

  return (
    <Router>
      <div className="App">
        <div className="left-panel">
        
          <h1>Block Number: {blockNumber}</h1>
          <h2>Timestamp: {new Date(timestamp * 1000).toLocaleString()}</h2>
          
        </div>
        <div className="address-search">
            <input
              type="text"
              placeholder="Enter an address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="search-input"
            />
            <button onClick={handleAddressSearch}>Search Address</button>
            {balance && <div className="balance-display">Account ETH Balance: {balance}</div>} 

  {/* Token Balances Table */}
  {tokenBalances.length > 0 && (
    <>
     <h3 className="token-balances-title">ERC20 Token Account Balances</h3>
            <table className="token-balances-table">
              <thead>
                <tr>
                  <th>Contract Address</th>
                  <th>Token Balance</th>
                  <th>Name</th>
                  <th>Symbol</th>
                </tr>
              </thead>
              <tbody>
                {tokenBalances.map((token, index) => (
                  <tr key={index}>
                    <td>{token.contractAddress}</td>
                    <td>{Utils.formatUnits(token.tokenBalance, 'ether')}</td>
                    <td>{token.name}</td>
                   <td>{token.symbol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              <div className="table-navigation">
              <button onClick={goToFirstPage} disabled={currentPage === 0}>First</button>
              <button onClick={goToPreviousPage} disabled={currentPage === 0}>Previous</button>
              <button onClick={goToNextPage} disabled={currentPage === totalPages - 1}>Next</button>
              <button onClick={goToLastPage} disabled={currentPage === totalPages - 1}>Last</button>
            </div>
            </>
          )}



          </div>
          {/* Recent Transactions Table */}
{recentTransactions.length > 0 && (
  <div>
    <h3>Recent Transactions</h3>
    <table className="recent-transactions-table">
      <thead>
        <tr>
          <th>Block Number</th>
          <th>From</th>
          <th>To</th>
          <th>Value</th>
          <th>Token ID</th>
          <th>Asset</th>
          <th>Transaction Hash</th>
        </tr>
      </thead>
      <tbody>
        {recentTransactions.map((tx, index) => (
          <tr key={index}>
            <td>{parseInt(tx.blockNum, 16)}</td>
            <td>{tx.from}</td>
            <td>{tx.to}</td>
            <td>{tx.value ? formatEther(tx.value) : 'N/A'}</td>
            <td>{tx.tokenId}</td>
            <td>{tx.asset}</td>
            <td>{tx.hash}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}        







        {/* NFT Sales Table in its own div */}
        <div className="nft-sales-table-container">
        <h3 className="token-balances-title">Last Ten NFT Sales</h3>
          <table className="nft-sales-table">
            <thead>
              <tr>
                <th>Marketplace</th>
                <th>blockNumber</th>
                <th>Buyer Address</th>
                <th>Seller Address</th>
                <th>Contract Address</th>
                <th>Collection Name</th>
                <th>Token ID</th>
                <th>Price</th>
                <th>Currency</th>
                <th>Floor Price</th>
              </tr>
            </thead>
            <tbody>
              {nftSales.map((sale, index) => (
                <tr key={index}>
                  <td>{sale.marketplace}</td>
                  <td>{sale.blockNumber}</td>
                  <td>{sale.buyerAddress}</td>
                  <td>{sale.sellerAddress}</td>
                  <td>{sale.contractAddress}</td>
                  <td>{sale.contractName}</td>
                  <td>{sale.tokenId}</td>
                  <td>{ Utils.formatUnits(sale.sellerFee.amount, "ether")}</td>
                  <td>{sale.sellerFee.symbol}</td>
                  <td>{sale.floorPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="right-panel">
          <Switch>
            <Route path="/detailed-view/:address" component={DetailedView} />
            <Route path="/">
              <Transactions
                transactions={transactions}
                page={currentPage}
                onPageChange={setCurrentPage}
                totalTransactions={transactions ? transactions.length : 0}
              />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
