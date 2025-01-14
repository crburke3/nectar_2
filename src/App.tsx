import { useState, useEffect } from 'react'
import nectarLogo from './assets/nectar.svg'
import './App.css'


function App() {

  const [color, setColor] = useState("red")
  const [count, setCount] = useState(0)
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

  useEffect(() => {
    // Send a message to the background script when the side panel opens
    chrome.runtime.sendMessage({ action: 'sidePanelOpened' });
  }, []);

  const onClick = async () => {
    console.log("FUCCCC")
    setCount(count + 1)
    let [tab] = await chrome.tabs.query({active: true})
    // had to add the <string[], void> as we are passing variable between
    // the popup and the page context, confusing as fuck but do whats below
    chrome.scripting.executeScript<string[], void>({
      target: {tabId: tab.id!},
      args: [color],
      func: (color) => {
        // alert("hello from my extension")

        document.body.style.backgroundColor = color
      }
    })
  }

  const clearLogs = () => {
    setUrlLogs([]); // Clear the logs in the state
    setNetworkLogs([]); // Clear network logs
    chrome.runtime.sendMessage({ action: 'clearLogs' }); // Send a message to the background script
  }

  const handleNewUrlClick = () => {
    // Send a message to the background script to trigger handleNewUrl
    chrome.runtime.sendMessage({ action: 'triggerHandleNewUrl' });
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
        <input type="color" onChange={(e) => setColor(e.currentTarget.value)} />
        <button onClick={onClick}>
          count is {count}
        </button>
        <button onClick={clearLogs}>Clear Logs</button>
        <button onClick={handleNewUrlClick}>Check Page</button>
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
