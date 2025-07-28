# Status Grid Feature

## Overview

The new expandable status grid provides an intuitive way to filter students by their status. Instead of traditional tabs, users can now click a button to expand a grid of status boxes, select a status, and automatically fetch filtered data from the backend.

## Features

### 🎯 **Expandable Grid**
- Click "Show Status Grid" button to expand the status selection interface
- Grid displays all available student statuses in a responsive layout
- Each status box shows a color indicator and status name
- Grid automatically closes when a status is selected

### 🔄 **Dynamic API Calls**
- Automatically fetches data from backend when status is selected
- Uses API endpoint: `http://localhost/lifeboat/Admin/get_all_students?offset=0&limit=5&status={status_number}`
- Status numbers correspond to the `StudentStatus` enum values
- Supports filtering by any status or "All Students"

### 📊 **Current Status Display**
- Shows currently selected status with a colored badge
- "Clear Filter" button to reset to "All Students"
- Real-time status indicator

### 🎨 **Visual Design**
- Responsive grid layout (2-5 columns based on screen size)
- Color-coded status indicators
- Hover effects and active state highlighting
- Clean, modern UI with proper spacing

## API Integration

### Status Numbers
```typescript
enum StudentStatus {
  NEW_USER = 0,
  MOBILE_VERIFIED = 1,
  PROFILE_UPDATED = 2,
  PROFILE_APPROVED = 3,
  INTERVIEW_SCHEDULED = 4,
  DOCUMENT_UPLOADED = 5,
  WAITING_FOR_PAYMENT = 6,
  PAYMENT_COMPLETED = 7,
  PAYMENT_VERIFIED = 8,
  RECEIPT_VERIFIED = 9,
  CERTIFICATE_UPLOADED = 10,
  NEXT_SEMESTER = 11,
  ALUMNI = 12,
  BLOCKED = 13,
}
```

### API Calls
- **All Students**: `GET /Admin/get_all_students?offset=0&limit=5`
- **Filtered by Status**: `GET /Admin/get_all_students?offset=0&limit=5&status=1`
- **Example**: Status 1 (Mobile Verified) = `&status=1`

## User Flow

### 1. **Initial State**
- Grid is collapsed by default
- Shows "All Students" as current status
- Displays all students without filtering

### 2. **Expand Grid**
- Click "Show Status Grid" button
- Grid expands with all available statuses
- Each status box is clickable

### 3. **Select Status**
- Click any status box
- Grid automatically collapses
- API call is made with selected status
- Table updates with filtered data
- Current status badge updates

### 4. **Clear Filter**
- Click "Clear Filter" button
- Resets to "All Students"
- Fetches all students without status filter

## Technical Implementation

### State Management
```typescript
const [isStatusGridExpanded, setIsStatusGridExpanded] = useState(false);
const [currentStatus, setCurrentStatus] = useState<StudentStatus | null>(null);
```

### API Function
```typescript
const loadStudentsByStatus = async (status: StudentStatus | null) => {
  const response = await fetchStudents({
    offset: 0,
    limit: 5,
    status: status,
    search: undefined,
  });
  // Handle response...
};
```

### Grid Layout
```typescript
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
  {/* Status boxes */}
</div>
```

## Benefits

### ✅ **Better UX**
- Intuitive visual interface
- Clear status representation
- Easy to understand and use

### ✅ **Dynamic Loading**
- Real-time data fetching
- No page reloads
- Smooth transitions

### ✅ **Responsive Design**
- Works on all screen sizes
- Adaptive grid layout
- Mobile-friendly

### ✅ **Performance**
- Efficient API calls
- Minimal re-renders
- Optimized state management

## Future Enhancements

### 🚀 **Potential Improvements**
1. **Status Counts**: Show number of students per status
2. **Quick Actions**: Add common actions per status
3. **Search Integration**: Combine with text search
4. **Bulk Operations**: Select multiple statuses
5. **Custom Filters**: Save favorite status combinations

### 📈 **Analytics**
- Track most used statuses
- Monitor filter usage patterns
- Performance metrics

## Usage Examples

### Filter by Mobile Verified Students
1. Click "Show Status Grid"
2. Click "Mobile Verified" box
3. API calls: `GET /Admin/get_all_students?offset=0&limit=5&status=1`
4. Table shows only mobile verified students

### Filter by Payment Completed
1. Click "Show Status Grid"
2. Click "Payment Completed" box
3. API calls: `GET /Admin/get_all_students?offset=0&limit=5&status=7`
4. Table shows only payment completed students

### Reset to All Students
1. Click "Clear Filter" button
2. API calls: `GET /Admin/get_all_students?offset=0&limit=5`
3. Table shows all students 