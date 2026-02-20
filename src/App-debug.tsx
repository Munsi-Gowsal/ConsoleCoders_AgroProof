/**
 * Debug version of App to test rendering
 */

function AppDebug() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>AgriProof Debug</h1>
      <p>If you see this, React is rendering correctly!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default AppDebug;
