# Backend Integration Setup Guide

## Quick Setup

### 1. Environment Configuration

Create a `.env.local` file in your project root with:

```env
# Backend API Configuration
NEXT_PUBLIC_BASE_URL=http://127.0.0.1:8000

# Other existing variables...
```

### 2. Backend Requirements

Your backend should be running on `http://127.0.0.1:8000` with:

- **Endpoint**: `POST /upload-financial-document`
- **Content-Type**: `multipart/form-data`
- **Field Name**: `file`
- **Supported Files**: Excel (.xlsx), CSV, PDF

### 3. CORS Configuration

Make sure your backend allows requests from your frontend origin. Add to your FastAPI app:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Test Your Setup

1. Start your backend server on port 8000
2. Start your Next.js app: `npm run dev`
3. Navigate to `/upload`
4. Upload a financial document
5. Check browser console for any errors

### Troubleshooting

- **Connection Failed**: Check if backend is running on the correct port
- **CORS Error**: Verify CORS middleware is configured correctly
- **File Upload Issues**: Ensure your backend accepts multipart form data with `file` field
- **Analysis Errors**: Check backend logs for processing errors

Your backend API response should match the structure expected by the frontend components.
