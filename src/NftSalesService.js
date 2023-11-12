import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY, // Ensure this is set in your environment variables
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

export const getNFTSales = async (blockNumber) => {
  const nftsalesResponse = await alchemy.nft.getNftSales({
    fromBlock: blockNumber - 100,
    toBlock: blockNumber,
    limit: 10,
  });

  const contractAddresses = nftsalesResponse.nftSales.map(sale => sale.contractAddress);
  const floorPrices = {};
  const names = {};

  for (const contractAddress of contractAddresses) {
    try {
      const floorPriceResponse = await alchemy.nft.getFloorPrice(contractAddress);
      floorPrices[contractAddress] = floorPriceResponse.openSea.floorPrice;
    } catch (error) {
      console.error(`Error fetching floor price for contract ${contractAddress}:`, error);
    }
  }

  for (const contractAddress of contractAddresses) {
    try {
      const metaResponse = await alchemy.nft.getContractMetadata(contractAddress);
      names[contractAddress] = metaResponse.name;
    } catch (error) {
      console.error(`Error fetching metadata for contract ${contractAddress}:`, error);
    }
  }

  const nftSalesWithFloorPrices = nftsalesResponse.nftSales.map(sale => ({
    ...sale,
    floorPrice: floorPrices[sale.contractAddress] || null,
    contractName: names[sale.contractAddress] || null,
  }));

  return nftSalesWithFloorPrices;
};
