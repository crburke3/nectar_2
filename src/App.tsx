import { useState, useEffect } from 'react'
import nectarLogo from './assets/nectar.svg'
import './App.css'


function App() {

  const [urlLogs, setUrlLogs] = useState<string[]>([])
  const [networkLogs, setNetworkLogs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'url' | 'network'>('url')

  useEffect(() => {
    const handleMessage = (message: { text: string; type: string }) => {
      if (message.type === 'log') {
        setUrlLogs((prevLogs) => [...prevLogs, message.text])
      } else if (message.type === 'networkLog') {
        setNetworkLogs((prevLogs) => [...prevLogs, message.text])
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const sendMessageToContentScript = () => {
    chrome.runtime.sendMessage({ greeting: "Hello from app.tsx" }, (response) => {
        console.log("Response from content.js:", response);
    });
};

  const showAffiliatePopup = () => {
    // Send a message to the background script to show the affiliate popup
    console.log("Showing affiliate popup");
    chrome.runtime.sendMessage({ type: "SHOW_AFFILIATE_POPUP", message: "Nectar is active! Enjoy 2% back on your purchase." });
  };

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={nectarLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Nectar</h1>
      <div className="card">
        <button onClick={showAffiliatePopup}>Show Affiliate Popup</button>
        <button onClick={sendMessageToContentScript}>Send Message</button>
      </div>

      <div className="tabs">
        <button onClick={() => setActiveTab('url')} className={activeTab === 'url' ? 'active' : ''}>
          URL Change Logs
        </button>
        <button onClick={() => setActiveTab('network')} className={activeTab === 'network' ? 'active' : ''}>
          Network Logs
        </button>
      </div>

      {activeTab === 'url' && (
        <div className="url-logs">
          <h2>URL Change Logs</h2>
          <ul>
            {urlLogs.map((url, index) => (
              <li key={index}>{url}</li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === 'network' && (
        <div className="network-logs">
          <h2>Network Logs</h2>
          <ul>
            {networkLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default App
