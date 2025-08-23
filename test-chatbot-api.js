#!/usr/bin/env node

/**
 * Simple test script to verify chatbot API endpoints are working
 * Run with: node test-chatbot-api.js
 */

const BASE_URL = "http://localhost:3000/api/chatbot";

async function testAPI(endpoint, method = "GET", body = null) {
  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Error (${response.status}):`, JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("🚀 Starting Chatbot API Tests");
  console.log("Note: These tests assume you're authenticated and have data in your database");
  
  // Test document summary
  await testAPI("/document-summary");
  
  // Test suggested questions
  await testAPI("/suggested-questions");
  
  // Test documents list
  await testAPI("/documents");
  
  // Test chat with a simple message
  await testAPI("/chat", "POST", {
    message: "Hello, can you tell me about my financial data?",
    conversation_history: []
  });
  
  console.log("\n🏁 Tests completed!");
  console.log("\nIf you see 401 Unauthorized errors, make sure you're logged in to the app first.");
  console.log("If you see database-related errors, check your PostgreSQL connection.");
  console.log("If chat returns fallback mode, the Python backend might not be running.");
}

// Run the tests
runTests().catch(console.error);
