# Student Status System

This document describes the student status system implemented in the Lifeboat Admin application.

## Student Status Enum

The system uses a TypeScript enum to define all possible student statuses:

```typescript
export enum StudentStatus {
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

## Status Flow

The typical student journey follows this progression:

1. **NEW_USER** (0) - Student registers but hasn't updated profile
2. **PERSONAL_DETAILS_PENDING** (1) - Student needs to update their personal details
3. **PERSONAL_DETAILS_SUBMITTED** (2) - Personal details have been submitted
4. **INTERVIEW_SCHEDULED** (3) - Interview has been scheduled
5. **ACADEMIC_DOCUMENTS_PENDING** (4) - Academic documents are pending submission
6. **ACADEMIC_DOCUMENTS_SUBMITTED** (5) - Academic documents have been submitted
7. **ELIGIBLE_FOR_SCHOLARSHIP** (6) - Student is eligible for scholarship
8. **PAYMENT_PENDING** (7) - Student is waiting to make payment
9. **PAID** (8) - Payment has been completed
10. **PAYMENT_VERIFIED** (9) - Payment has been verified by admin
11. **RECEIPT_DOCUMENTS_SUBMITTED** (10) - Receipt documents have been submitted
12. **ALUMNI** (11) - Student has completed the program
13. **BLOCKED** (12) - Student account has been blocked

## API Integration

### Authentication
All API calls require authentication using a Bearer token stored in localStorage as 'authToken'.

### Fetch Students
- **Endpoint**: `GET /Admin/get_all_students`
- **Headers**:
  - `Authorization`: `Bearer {authToken}`
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`
- **Parameters**:
  - `offset`: Number of records to skip
  - `limit`: Number of records to return
  - `status`: (Optional) Filter by specific status
  - `search`: (Optional) Search by name, ID, or college

### Update Student Status
- **Endpoint**: `POST /Admin/update_student_status`
- **Headers**:
  - `Authorization`: `Bearer {authToken}`
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`
- **Body**:
  ```json
  {
    "student_id": "string",
    "status": "number"
  }
  ```

### Block Student
- **Endpoint**: `POST /Admin/block_student`
- **Headers**:
  - `Authorization`: `Bearer {authToken}`
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`
- **Body**:
  ```json
  {
    "student_id": "string"
  }
  ```

## Frontend Implementation

### Files Modified/Created

1. **`src/types/student.ts`** - TypeScript interfaces and enum
2. **`src/utils/studentService.ts`** - API service functions
3. **`src/pages/admin/AdminStudents.tsx`** - Updated component with API integration

### Key Features

- **Single API Call**: Students are fetched only once on component mount
- **Authentication**: All API calls include Bearer token authentication
- **Status Filtering**: Filter students by specific status
- **Search Functionality**: Search by name, ID, or college
- **Bulk Operations**: Update status for multiple students at once
- **Local State Updates**: Status changes update local state without API refresh
- **Manual Refresh**: Refresh button to manually reload data when needed
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Loading indicators during API calls
- **Fallback Data**: Development fallback when API is unavailable

### Status Display

Each status has:
- **Display Text**: Human-readable status name
- **Color Coding**: Visual distinction with CSS classes
- **Progress Tracking**: Status bar showing completed steps

### Admin Actions

1. **View Student Details**: Click eye icon to see full student information
2. **Change Status**: Update individual student status
3. **Block Student**: Block student account
4. **Bulk Status Change**: Update multiple students at once
5. **Login as User**: (Placeholder for future implementation)

## Development Notes

- The system includes fallback data for development when the API is not available
- All API calls include proper error handling
- TypeScript provides type safety throughout the application
- The UI is responsive and includes loading states
- Status changes are logged with admin ID for audit purposes

## Testing

To test the system:

1. Start the development server: `npm run dev`
2. Navigate to the Admin Students page
3. The system will attempt to fetch data from the API
4. If the API is not available, fallback data will be displayed
5. Test status changes and bulk operations
6. Verify error handling by temporarily disabling the API

## Future Enhancements

- Add pagination controls
- Implement real-time updates via WebSocket
- Add export functionality for student lists
- Implement advanced filtering options
- Add audit trail for status changes 