## Local CURL Test API
curl -X POST http: //localhost:8080/api/adEvent \
  -H "x-api-key: test-api-key-local" \
  -H "Content-Type: application/json" \
  -d '{
  "adId": "test-ad-123",
  "userId": "test-user-456",
  "eventType": "click",
  "eventData": {
    "campaign": "spring-sale",
    "source": "website-abc"
  }
}'