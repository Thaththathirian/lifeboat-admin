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
  PERSONAL_DETAILS_PENDING = 1,
  PERSONAL_DETAILS_SUBMITTED = 2,
  INTERVIEW_SCHEDULED = 3,
  ACADEMIC_DOCUMENTS_PENDING = 4,
  ACADEMIC_DOCUMENTS_SUBMITTED = 5,
  ELIGIBLE_FOR_SCHOLARSHIP = 6,
  PAYMENT_PENDING = 7,
  PAID = 8,
  PAYMENT_VERIFIED = 9,
  RECEIPT_DOCUMENTS_SUBMITTED = 10,
  ALUMNI = 11,
  BLOCKED = 12,
}
```

### API Calls
- **All Students**: `GET /Admin/get_all_students?offset=0&limit=5`
- **Filtered by Status**: `GET /Admin/get_all_students?offset=0&limit=5&status=1`
- **Example**: Status 1 (Personal Details Pending) = `&status=1`

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

### Filter by Personal Details Pending Students
1. Click "Show Status Grid"
2. Click "Personal Details Pending" box
3. API calls: `GET /Admin/get_all_students?offset=0&limit=5&status=1`
4. Table shows only personal details pending students

### Filter by Payment Completed
1. Click "Show Status Grid"
2. Click "Paid" box
3. API calls: `GET /Admin/get_all_students?offset=0&limit=5&status=8`
4. Table shows only payment completed students

### Reset to All Students
1. Click "Clear Filter" button
2. API calls: `GET /Admin/get_all_students?offset=0&limit=5`
3. Table shows all students 