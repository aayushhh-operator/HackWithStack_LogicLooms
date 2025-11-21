import {
  AlertCircle,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../contexts/AuthContext";
import { useLoan } from "../hooks/useLoan";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { account, connectWallet, isConnected } = useWeb3();
  const { getUserReputation, getBorrowerLoans, getLenderLoans } = useLoan();

  const [reputation, setReputation] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    age: 30,
    income: 50000,
    employmentLength: 5,
  });
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    completedLoans: 0,
    totalBorrowed: 0,
    totalLent: 0,
    totalRepaid: 0,
    totalEarned: 0,
    defaultedLoans: 0,
  });
  const [loading, setLoading] = useState(false);
  const [calculatingRisk, setCalculatingRisk] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      // Initialize edit form with user data
      setEditFormData({
        name: user.name || "",
        phone: user.phone || "",
        age: user.age || 30,
        income: user.income || 50000,
        employmentLength: user.employmentLength || 5,
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isConnected && account) {
      fetchUserData();
    }
  }, [isConnected, account]);

  const fetchUserData = async () => {
    if (!account) return;

    setLoading(true);
    try {
      // Fetch reputation
      const rep = await getUserReputation(account);
      setReputation(rep);

      // Fetch loan statistics
      const borrowerLoans = await getBorrowerLoans(account);
      const lenderLoans = await getLenderLoans(account);

      const totalLoans = borrowerLoans.length + lenderLoans.length;
      const activeBorrower = borrowerLoans.filter((l) => l.status === 1).length;
      const activeLender = lenderLoans.filter((l) => l.status === 1).length;
      const completedBorrower = borrowerLoans.filter(
        (l) => l.status === 2
      ).length;
      const completedLender = lenderLoans.filter((l) => l.status === 2).length;
      const defaultedLoans = borrowerLoans.filter((l) => l.status === 3).length;

      const totalBorrowed = borrowerLoans.reduce(
        (sum, loan) => sum + parseFloat(loan.amount || 0),
        0
      );
      const totalLent = lenderLoans.reduce(
        (sum, loan) => sum + parseFloat(loan.amount || 0),
        0
      );
      const totalRepaid = borrowerLoans
        .filter((l) => l.status === 2)
        .reduce((sum, loan) => sum + parseFloat(loan.repaidAmount || 0), 0);
      const totalEarned = lenderLoans
        .filter((l) => l.status === 2)
        .reduce(
          (sum, loan) =>
            sum + parseFloat(loan.amount || 0) * (loan.interestRate / 100),
          0
        );

      setStats({
        totalLoans,
        activeLoans: activeBorrower + activeLender,
        completedLoans: completedBorrower + completedLender,
        totalBorrowed,
        totalLent,
        totalRepaid,
        totalEarned,
        defaultedLoans,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(editFormData);
      setIsEditingProfile(false);
      alert(
        "Profile updated successfully! Your risk score has been recalculated."
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score = reputation) => {
    if (score >= 80) return { label: "Low Risk", color: "green" };
    if (score >= 60) return { label: "Medium Risk", color: "blue" };
    if (score >= 40) return { label: "Moderate Risk", color: "yellow" };
    if (score >= 20) return { label: "High Risk", color: "orange" };
    return { label: "High Risk", color: "red" };
  };

  // Use user's risk score from backend (auto-calculated from profile data)
  const displayScore = user?.riskScore || reputation;
  const riskLevel = getRiskLevel(displayScore);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const goBack = () => {
    if (user?.userType === "lender") {
      navigate("/lender");
    } else {
      navigate("/borrower");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="btn-outline text-sm flex items-center px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-black">My Profile</h1>
            </div>
            <div className="flex items-center space-x-3">
              {account ? (
                <div className="glass-card px-3 py-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-mono text-gray-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              ) : (
                <button onClick={connectWallet} className="btn-outline text-sm">
                  Connect Wallet
                </button>
              )}
              <button onClick={handleLogout} className="btn-outline text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom py-8">
        {!isConnected ? (
          <div className="glass-card p-10 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
            <h3 className="text-xl font-bold mb-2 text-black">
              Connect Your Wallet
            </h3>
            <p className="text-gray-500 mb-6">
              Connect MetaMask to view your profile
            </p>
            <button onClick={connectWallet} className="btn-primary px-6 py-3">
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </button>
          </div>
        ) : loading ? (
          <div className="glass-card p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal & Financial Information */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Personal & Financial Information
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn-outline text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={editFormData.age}
                        onChange={handleEditChange}
                        min="18"
                        max="100"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Annual Income ($)
                      </label>
                      <input
                        type="number"
                        name="income"
                        value={editFormData.income}
                        onChange={handleEditChange}
                        min="0"
                        step="1000"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Employment Length (years)
                      </label>
                      <input
                        type="number"
                        name="employmentLength"
                        value={editFormData.employmentLength}
                        onChange={handleEditChange}
                        min="0"
                        max="50"
                        step="0.5"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                  <p className="text-sm text-blue-600">
                    * Changes to financial information will automatically
                    recalculate your risk score
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-base font-semibold text-black">
                          {user?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base font-semibold text-black">
                          {user?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-base font-semibold text-black">
                          {user?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="text-base font-semibold text-black">
                          {user?.age || "N/A"} years
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p className="text-base font-semibold text-black capitalize">
                          {user?.userType || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Annual Income</p>
                        <p className="text-base font-semibold text-black">
                          ${(user?.income || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">
                          Employment Length
                        </p>
                        <p className="text-base font-semibold text-black">
                          {user?.employmentLength || "N/A"} years
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Wallet Address</p>
                        <p className="text-sm font-mono text-black break-all">
                          {account}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Score & Reputation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-blue-600" />
                  Reputation Score
                </h2>
                <div className="text-center">
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="relative inline-flex items-center justify-center w-40 h-40 mb-4">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke={`${
                            riskLevel.color === "green"
                              ? "#10b981"
                              : riskLevel.color === "blue"
                              ? "#3b82f6"
                              : riskLevel.color === "yellow"
                              ? "#f59e0b"
                              : riskLevel.color === "orange"
                              ? "#f97316"
                              : "#ef4444"
                          }`}
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(displayScore / 100) * 440} 440`}
                        />
                      </svg>
                      <div className="absolute">
                        <p className="text-4xl font-bold text-black">
                          {displayScore}
                        </p>
                        <p className="text-sm text-gray-500">out of 100</p>
                      </div>
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3 ${
                        riskLevel.color === "green"
                          ? "bg-green-100 text-green-700"
                          : riskLevel.color === "blue"
                          ? "bg-blue-100 text-blue-700"
                          : riskLevel.color === "yellow"
                          ? "bg-yellow-100 text-yellow-700"
                          : riskLevel.color === "orange"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {riskLevel.label}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    AI-Powered Risk Assessment
                  </div>
                  <p className="text-sm text-gray-600">
                    Your risk score is automatically calculated based on your
                    age, income, and employment length.
                  </p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                  Loan Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Loans</span>
                    <span className="text-lg font-bold text-black">
                      {stats.totalLoans}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Active Loans</span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats.activeLoans}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">
                      Completed Loans
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.completedLoans}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-600">
                      Defaulted Loans
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {stats.defaultedLoans}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Statistics */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
                Financial Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-sm text-gray-600 mb-1">
                    Total Borrowed
                  </div>
                  <div className="text-2xl font-bold text-black">
                    {stats.totalBorrowed.toFixed(4)} ETH
                  </div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-gray-600 mb-1">Total Lent</div>
                  <div className="text-2xl font-bold text-black">
                    {stats.totalLent.toFixed(4)} ETH
                  </div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-gray-600 mb-1">Total Repaid</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalRepaid.toFixed(4)} ETH
                  </div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-gray-600 mb-1">Total Earned</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalEarned.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                Performance Indicators
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-black">
                    {stats.totalLoans > 0
                      ? Math.round(
                          (stats.completedLoans / stats.totalLoans) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">On-Time Payments</p>
                  <p className="text-2xl font-bold text-black">
                    {stats.completedLoans > 0
                      ? Math.round(
                          ((stats.completedLoans - stats.defaultedLoans) /
                            stats.completedLoans) *
                            100
                        )
                      : 100}
                    %
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Default Rate</p>
                  <p className="text-2xl font-bold text-black">
                    {stats.totalLoans > 0
                      ? Math.round(
                          (stats.defaultedLoans / stats.totalLoans) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
