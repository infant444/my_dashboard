async function testConnection() {
  const url = 'https://onbbkkwtoxqtliwwbptx.supabase.co';
  
  console.log('Testing connection to:', url);
  
  try {
    const response = await fetch(url, { 
      method: 'GET',
      signal: AbortSignal.timeout(30000)
    });
    console.log('✅ Connection successful!', response.status);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Cause:', error.cause);
  }
}

testConnection();
