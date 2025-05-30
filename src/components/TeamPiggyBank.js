import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../utils/contractABI.json";

const TeamPiggyBank = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [totalBalance, setTotalBalance] = useState("0");
  const [savingsGoal, setSavingsGoal] = useState("0");
  const [memberCount, setMemberCount] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newMember, setNewMember] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Updated contract address

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(contract);

          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);

          await loadContractData();
        } catch (error) {
          setError("Error connecting to wallet: " + error.message);
        }
      } else {
        setError("Please install MetaMask!");
      }
    };

    init();
  }, []);

  const loadContractData = async () => {
    try {
      const balance = await contract.getTotalBalance();
      const goal = await contract.getSavingsGoal();
      const count = await contract.getMemberCount();

      setTotalBalance(ethers.utils.formatEther(balance));
      setSavingsGoal(ethers.utils.formatEther(goal));
      setMemberCount(count.toNumber());

      // Load member details
      const memberDetails = [];
      for (let i = 0; i < count.toNumber(); i++) {
        const details = await contract.getMemberDetails(i);
        memberDetails.push({
          address: details.memberAddress,
          contribution: ethers.utils.formatEther(details.contribution),
          lastContribution: new Date(
            details.lastContribution.toNumber() * 1000
          ).toLocaleDateString(),
          isActive: details.isActive,
        });
      }
      setMembers(memberDetails);
    } catch (error) {
      setError("Error loading contract data: " + error.message);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = ethers.utils.parseEther(depositAmount);
      const tx = await contract.deposit({ value: amount });
      await tx.wait();
      await loadContractData();
      setDepositAmount("");
    } catch (error) {
      setError("Error depositing: " + error.message);
    }
    setLoading(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = ethers.utils.parseEther(withdrawAmount);
      const tx = await contract.withdraw(amount);
      await tx.wait();
      await loadContractData();
      setWithdrawAmount("");
    } catch (error) {
      setError("Error withdrawing: " + error.message);
    }
    setLoading(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tx = await contract.addMember(newMember);
      await tx.wait();
      await loadContractData();
      setNewMember("");
    } catch (error) {
      setError("Error adding member: " + error.message);
    }
    setLoading(false);
  };

  const handleSetGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = ethers.utils.parseEther(newGoal);
      const tx = await contract.setSavingsGoal(amount);
      await tx.wait();
      await loadContractData();
      setNewGoal("");
    } catch (error) {
      setError("Error setting goal: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Team Piggy Bank</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Piggy Bank Status</h2>
          <p>Total Balance: {totalBalance} ETH</p>
          <p>Savings Goal: {savingsGoal} ETH</p>
          <p>Member Count: {memberCount}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          <p>Connected Account: {account}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Deposit</h2>
          <form onSubmit={handleDeposit}>
            <input
              type="number"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Amount in ETH"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Processing..." : "Deposit"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Withdraw</h2>
          <form onSubmit={handleWithdraw}>
            <input
              type="number"
              step="0.01"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Amount in ETH"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Add Member</h2>
          <form onSubmit={handleAddMember}>
            <input
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Member Address"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Processing..." : "Add Member"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Set Savings Goal</h2>
          <form onSubmit={handleSetGoal}>
            <input
              type="number"
              step="0.01"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Goal in ETH"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Processing..." : "Set Goal"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Address</th>
                <th className="text-left">Contribution</th>
                <th className="text-left">Last Contribution</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={index}>
                  <td>{member.address}</td>
                  <td>{member.contribution} ETH</td>
                  <td>{member.lastContribution}</td>
                  <td>{member.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamPiggyBank;
