# API Debug Guide

## Issues Fixed

### 1. Multiple API Calls
- **Problem**: API was being called 4 times due to component re-renders
- **Solution**: Added `useRef` to prevent multiple calls
- **Code**: `hasLoadedRef.current` flag prevents duplicate calls

### 2. Token Not Passing
- **Problem**: Authentication token wasn't being properly retrieved or passed
- **Solution**: Fixed token retrieval to use same method as college API (`adminAuth` instead of `authToken`)
- **Code**: Updated `getAuthToken()` to parse `localStorage.getItem('adminAuth')` like college service

## Debug Buttons Added

1. **Refresh** - Manually call the API with current settings
2. **Download List** - Download student data
3. **Bulk Status Change** - Change status for multiple selected students

## Console Logs to Watch

### API Call Process
```
🔄 Starting to load students...
🔑 Auth token exists: true/false
🔑 Auth token value: [token preview]...
📡 Calling fetchStudents API...
🚀 fetchStudents called with params: {...}
🌐 API Base URL: http://localhost/lifeboat
🔗 Full URL: http://localhost/lifeboat/Admin/get_all_students?offset=0&limit=5
🔍 getAuthToken called, token found: true/false
🔑 Auth token retrieved: true/false
🔑 Authorization header set: Bearer [token preview]...
📤 Making fetch request...
📥 Response status: 200/401/500
📥 Response ok: true/false
📥 API Response: {...}
✅ Successfully loaded students: [count]
🏁 Finished loading students
```

### Error Cases
```
❌ API returned error: [error message]
💥 Exception during API call: [error]
⚠️ No auth token found, trying without authentication
🚫 API already called, skipping...
```

## Testing Steps

### 1. Check Current State
1. Open browser console (F12)
2. Look for the detailed logs when page loads
3. Check if "API already called, skipping..." appears

### 2. Test Authentication
1. Check browser console for token logs
2. Use browser developer tools to inspect localStorage
3. Click "Refresh" to test API calls

### 3. Debug API Call
1. Refresh the page to trigger new API call
2. Watch console for detailed logs
3. Check Network tab in Developer Tools

### 4. Manual API Test
Run this in browser console:
```javascript
// Test the API directly
const adminAuth = localStorage.getItem('adminAuth');
const token = adminAuth ? JSON.parse(adminAuth).access_token : null;

fetch('http://localhost/lifeboat/Admin/get_all_students?offset=0&limit=5', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}).then(r => r.json()).then(console.log);
```

## Expected Behavior

### With Valid Token
- API call with `Authorization: Bearer [token]` header
- Response status 200
- Students data loaded

### Without Token
- API call without authorization header
- Response status 401 (expected)
- Fallback data shown in development

### Multiple Calls Prevention
- Only one API call on component mount
- Subsequent renders skip API call
- Manual refresh available via button

## Troubleshooting

### If API Still Called Multiple Times
1. Check console for "🚫 API already called, skipping..."
2. If not appearing, component is re-mounting
3. Check parent component for unnecessary re-renders

### If Token Not Passing
1. Check "🔑 Auth token exists" log
2. Verify token format in "🔑 Auth token value" log
3. Check "🔑 Authorization header set" log
4. Use "Check Token" button to verify localStorage

### If API Returns 401
1. Verify token is valid and not expired
2. Check if backend expects different token format
3. Test API directly in browser console
4. Check backend logs for authentication errors

## API Endpoint Details

- **URL**: `http://localhost/lifeboat/Admin/get_all_students`
- **Method**: GET
- **Parameters**: 
  - `offset`: 0
  - `limit`: 5
- **Headers**:
  - `Content-Type`: application/json
  - `Accept`: application/json
  - `Authorization`: Bearer [token] (if available) 