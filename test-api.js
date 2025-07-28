// Simple test script to debug the API call
// Run this in the browser console to test the API

async function testStudentAPI() {
  console.log('🧪 Testing Student API...');
  
  const url = 'http://localhost/lifeboat/Admin/get_all_students?offset=0&limit=5';
  console.log('🔗 URL:', url);
  
  // Test without auth token
  console.log('📤 Testing without auth token...');
  try {
    const response1 = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    console.log('📥 Response 1 status:', response1.status);
    console.log('📥 Response 1 ok:', response1.ok);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success without auth:', data1);
    } else {
      const error1 = await response1.text();
      console.log('❌ Error without auth:', error1);
    }
  } catch (error) {
    console.error('💥 Exception without auth:', error);
  }
  
  // Test with auth token if available
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    console.log('📤 Testing with auth token...');
    try {
      const response2 = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      console.log('📥 Response 2 status:', response2.status);
      console.log('📥 Response 2 ok:', response2.ok);
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('✅ Success with auth:', data2);
      } else {
        const error2 = await response2.text();
        console.log('❌ Error with auth:', error2);
      }
    } catch (error) {
      console.error('💥 Exception with auth:', error);
    }
  } else {
    console.log('⚠️ No auth token found in localStorage');
  }
}

// Function to set auth token for testing
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
  console.log('🔑 Auth token set:', token);
}

// Function to clear auth token
function clearAuthToken() {
  localStorage.removeItem('authToken');
  console.log('🗑️ Auth token cleared');
}

// Export functions for use in console
window.testStudentAPI = testStudentAPI;
window.setAuthToken = setAuthToken;
window.clearAuthToken = clearAuthToken;

console.log('🧪 Test functions available:');
console.log('- testStudentAPI() - Test the API call');
console.log('- setAuthToken(token) - Set auth token for testing');
console.log('- clearAuthToken() - Clear auth token');

// Auto-run test
testStudentAPI(); 