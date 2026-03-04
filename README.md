# BiteSpeed Identity Reconciliation API

Backend API that identifies and links customer contacts using email and phone number.

## Live Endpoint
POST https://bitespeed-identity-reconciliation-1-pgi0.onrender.com/identify

## Tech Stack
Node.js
Express
TypeScript
Prisma ORM
PostgreSQL (Neon)
Render (Deployment)

## Example Request
{
 "email": "test@test.com",
 "phoneNumber": "111111"
}

## Example Response
{
 "contact": {
   "primaryContactId": 5,
   "emails": ["test@test.com","new@test.com"],
   "phoneNumbers": ["111111"],
   "secondaryContactIds": [6]
 }
}