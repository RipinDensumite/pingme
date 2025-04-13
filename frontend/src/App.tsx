import { useState, useEffect } from "react";
import "./App.css";

// Define types for our data
interface Server {
  id: number;
  name: string;
  ip_address: string;
  description: string;
  is_active: boolean;
}

interface PingResult {
  status: string;
  responseTime: number;
}

interface SpeedResult {
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
}

interface Settings {
  enable_ping_logs: string;
  enable_speed_logs: string;
  ping_interval: string;
  speed_interval: string;
}

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [pingResults, setPingResults] = useState<Record<number, PingResult>>({});
  const [speedResults, setSpeedResults] = useState<Record<number, SpeedResult>>({});
  const [settings, setSettings] = useState<Settings>({
    enable_ping_logs: "true",
    enable_speed_logs: "true",
    ping_interval: "60",
    speed_interval: "300"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Server>>({
    name: "",
    ip_address: "",
    description: "",
    is_active: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("servers");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPerformingAction, setIsPerformingAction] = useState<{[key: string]: boolean}>({});

  // Fetch all servers
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(`/api/servers`);
        const data = await response.json();
        if (data.success) {
          setServers(data.data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setIsLoading(false);
      }
    };

    fetchServers();
  }, []);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/monitor/settings`);
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    });
  };

  // Handle form submission for creating/updating server
  const handleServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPerformingAction({ ...isPerformingAction, saveServer: true });
      let response;
      if (isEditing && selectedServer) {
        // Update server
        response = await fetch(`/api/servers/${selectedServer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        // Create server
        response = await fetch(`/api/servers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh server list
        const serversResponse = await fetch(`/api/servers`);
        const serversData = await serversResponse.json();
        if (serversData.success) {
          setServers(serversData.data);
        }
        
        // Reset form
        setFormData({ name: "", ip_address: "", description: "", is_active: true });
        setIsEditing(false);
        setSelectedServer(null);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error saving server:", error);
    } finally {
      setIsPerformingAction({ ...isPerformingAction, saveServer: false });
    }
  };

  // Handle server deletion
  const handleDeleteServer = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this server?")) {
      try {
        setIsPerformingAction({ ...isPerformingAction, [`delete_${id}`]: true });
        const response = await fetch(`/api/servers/${id}`, {
          method: "DELETE"
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Remove server from list
          setServers(servers.filter(server => server.id !== id));
          if (selectedServer?.id === id) {
            setSelectedServer(null);
          }
        }
      } catch (error) {
        console.error("Error deleting server:", error);
      } finally {
        setIsPerformingAction({ ...isPerformingAction, [`delete_${id}`]: false });
      }
    }
  };

  // Handle server edit
  const handleEditServer = (server: Server) => {
    setFormData({
      name: server.name,
      ip_address: server.ip_address,
      description: server.description,
      is_active: server.is_active
    });
    setSelectedServer(server);
    setIsEditing(true);
    setShowAddForm(true);
  };

  // Handle ping test
  const handlePingServer = async (serverId: number) => {
    try {
      setIsPerformingAction({ ...isPerformingAction, [`ping_${serverId}`]: true });
      const response = await fetch(`/api/monitor/ping/${serverId}`);
      const data = await response.json();
      
      if (data.success) {
        setPingResults({
          ...pingResults,
          [serverId]: data.data.ping
        });
      }
    } catch (error) {
      console.error("Error pinging server:", error);
    } finally {
      setIsPerformingAction({ ...isPerformingAction, [`ping_${serverId}`]: false });
    }
  };

  // Handle speed test
  const handleSpeedTest = async (serverId: number) => {
    try {
      setIsPerformingAction({ ...isPerformingAction, [`speed_${serverId}`]: true });
      const response = await fetch(`/api/monitor/speed/${serverId}`);
      const data = await response.json();
      
      if (data.success) {
        setSpeedResults({
          ...speedResults,
          [serverId]: data.data.speed
        });
      }
    } catch (error) {
      console.error("Error running speed test:", error);
    } finally {
      setIsPerformingAction({ ...isPerformingAction, [`speed_${serverId}`]: false });
    }
  };

  // Handle settings update
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPerformingAction({ ...isPerformingAction, saveSettings: true });
      const response = await fetch(`/api/monitor/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show success toast
        const toast = document.getElementById("settings-toast");
        if (toast) {
          toast.classList.remove("hidden");
          setTimeout(() => {
            toast.classList.add("hidden");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setIsPerformingAction({ ...isPerformingAction, saveSettings: false });
    }
  };

  // Handle settings input changes
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? (checked ? "true" : "false") : value
    });
  };

  // Filter servers based on search term
  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6" y2="6"></line>
              <line x1="6" y1="18" x2="6" y2="18"></line>
            </svg>
            <h1 className="text-2xl font-bold tracking-tight">PingMe Server Monitor</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Last Updated: {new Date().toLocaleString()}</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab("servers")} 
                className={`px-4 py-4 font-medium text-sm transition-colors duration-150 ${activeTab === "servers" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"}`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6" y2="6"></line>
                    <line x1="6" y1="18" x2="6" y2="18"></line>
                  </svg>
                  Servers
                </div>
              </button>
              <button 
                onClick={() => setActiveTab("settings")} 
                className={`px-4 py-4 font-medium text-sm transition-colors duration-150 ${activeTab === "settings" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"}`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Settings
                </div>
              </button>
            </div>
            
            {activeTab === "servers" && (
              <div className="flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search servers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setIsEditing(false);
                    setSelectedServer(null);
                    setFormData({ name: "", ip_address: "", description: "", is_active: true });
                  }}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                  {showAddForm ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add Server
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Toast for settings saved */}
        <div id="settings-toast" className="hidden fixed top-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 shadow-md rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Settings saved successfully!
        </div>
        
        {/* Servers Tab */}
        {activeTab === "servers" && (
          <div className={`grid ${showAddForm ? 'grid-cols-1 lg:grid-cols-3 gap-6' : 'grid-cols-1'}`}>
            {/* Server List */}
            <div className={showAddForm ? "col-span-1 lg:col-span-2" : "col-span-1"}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">Server List</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage and monitor your servers</p>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div>
                    {filteredServers.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                          <line x1="6" y1="6" x2="6" y2="6"></line>
                          <line x1="6" y1="18" x2="6" y2="18"></line>
                        </svg>
                        <p className="text-gray-500 text-lg font-medium mb-1">No servers found</p>
                        <p className="text-gray-400 max-w-md">
                          {searchTerm ? 
                            `No results match "${searchTerm}". Try a different search term or clear your search.` : 
                            "Add your first server to start monitoring network performance."
                          }
                        </p>
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm("")}
                            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredServers.map(server => (
                          <div key={server.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div className="flex-grow mb-3 md:mb-0">
                                <div className="flex items-center mb-1">
                                  <h3 className="font-medium text-gray-900">{server.name}</h3>
                                  <span className={`ml-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    server.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {server.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                    <line x1="6" y1="6" x2="6" y2="6"></line>
                                    <line x1="6" y1="18" x2="6" y2="18"></line>
                                  </svg>
                                  IP: {server.ip_address}
                                </div>
                                {server.description && (
                                  <p className="text-sm text-gray-500 line-clamp-1">{server.description}</p>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <button 
                                  onClick={() => handlePingServer(server.id)}
                                  disabled={isPerformingAction[`ping_${server.id}`]}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                >
                                  {isPerformingAction[`ping_${server.id}`] ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 mr-1"></div>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                    </svg>
                                  )}
                                  Ping
                                </button>
                                <button 
                                  onClick={() => handleSpeedTest(server.id)}
                                  disabled={isPerformingAction[`speed_${server.id}`]}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                >
                                  {isPerformingAction[`speed_${server.id}`] ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 mr-1"></div>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                    </svg>
                                  )}
                                  Speed
                                </button>
                                <button 
                                  onClick={() => handleEditServer(server)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteServer(server.id)}
                                  disabled={isPerformingAction[`delete_${server.id}`]}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                >
                                  {isPerformingAction[`delete_${server.id}`] ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-500 mr-1"></div>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  )}
                                  Delete
                                </button>
                              </div>
                            </div>
                            
                            {/* Results display area */}
                            {(pingResults[server.id] || speedResults[server.id]) && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                  {/* Ping results card */}
                                  {pingResults[server.id] && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ping Results</h4>
                                      <div className="flex items-center">
                                        <span className={`h-3 w-3 rounded-full mr-2 ${
                                         pingResults[server.id].status === 'up' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></span>
                                        <span className="text-sm font-medium">
                                          {pingResults[server.id].status === 'up' ? 'Online' : 'Offline'}
                                        </span>
                                        {pingResults[server.id].responseTime && (
                                          <span className="ml-auto text-sm font-medium">
                                            {pingResults[server.id].responseTime}ms
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Speed test results card */}
                                  {speedResults[server.id] && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Speed Test Results</h4>
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <div className="text-xs text-gray-500">Download</div>
                                          <div className="text-sm font-medium">{speedResults[server.id].downloadSpeed} Mbps</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500">Upload</div>
                                          <div className="text-sm font-medium">{speedResults[server.id].uploadSpeed} Mbps</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500">Latency</div>
                                          <div className="text-sm font-medium">{speedResults[server.id].latency} ms</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Server Form */}
            {showAddForm && (
              <div className="col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">{isEditing ? "Edit Server" : "Add New Server"}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {isEditing ? "Update server details and configuration" : "Configure a new server to monitor"}
                    </p>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleServerSubmit}>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Server Name</label>
                          <input 
                            type="text" 
                            name="name" 
                            value={formData.name || ""} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                            required 
                            placeholder="e.g. Web Server"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                          <input 
                            type="text" 
                            name="ip_address" 
                            value={formData.ip_address || ""} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                            required 
                            placeholder="e.g. 192.168.1.1"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea 
                            name="description" 
                            value={formData.description || ""} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                            rows={3}
                            placeholder="Brief description of this server"
                          ></textarea>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center h-5">
                            <input
                              id="is_active"
                              type="checkbox" 
                              name="is_active" 
                              checked={formData.is_active || false} 
                              onChange={handleInputChange} 
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="is_active" className="font-medium text-gray-700">Active</label>
                            <p className="text-gray-500">Monitor this server's status</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-2">
                          <button 
                            type="button"
                            onClick={() => {
                              setShowAddForm(false);
                              setIsEditing(false);
                              setSelectedServer(null);
                              setFormData({ name: "", ip_address: "", description: "", is_active: true });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={isPerformingAction.saveServer}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                          >
                            {isPerformingAction.saveServer ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : isEditing ? (
                              <>Update Server</>
                            ) : (
                              <>Add Server</>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Monitor Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Configure how the monitoring system behaves</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSettingsUpdate}>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Ping Configuration</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enable_ping_logs"
                            name="enable_ping_logs"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={settings.enable_ping_logs === "true"}
                            onChange={handleSettingsChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enable_ping_logs" className="font-medium text-gray-700">Enable Ping Logs</label>
                          <p className="text-gray-500">Record ping results for historical analysis</p>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="ping_interval" className="block text-sm font-medium text-gray-700 mb-1">Ping Interval (seconds)</label>
                        <div className="mt-1 relative rounded-md shadow-sm max-w-xs">
                          <input
                            type="number"
                            name="ping_interval"
                            id="ping_interval"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                            value={settings.ping_interval}
                            onChange={handleSettingsChange}
                            min="5"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">sec</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Minimum value: 5 seconds</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Speed Test Configuration</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enable_speed_logs"
                            name="enable_speed_logs"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={settings.enable_speed_logs === "true"}
                            onChange={handleSettingsChange}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enable_speed_logs" className="font-medium text-gray-700">Enable Speed Test Logs</label>
                          <p className="text-gray-500">Record speed test results for historical analysis</p>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="speed_interval" className="block text-sm font-medium text-gray-700 mb-1">Speed Test Interval (seconds)</label>
                        <div className="mt-1 relative rounded-md shadow-sm max-w-xs">
                          <input
                            type="number"
                            name="speed_interval"
                            id="speed_interval"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                            value={settings.speed_interval}
                            onChange={handleSettingsChange}
                            min="60"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">sec</span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Minimum value: 60 seconds</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isPerformingAction.saveSettings}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    {isPerformingAction.saveSettings ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>Save Settings</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-2 md:mb-0">
              PingMe Server Monitor &copy; {new Date().getFullYear()}
            </div>
            <div className="flex space-x-4">
              <span className="text-xs text-gray-400">Version 1.2.0</span>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-800">Help</a>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-800">Documentation</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;