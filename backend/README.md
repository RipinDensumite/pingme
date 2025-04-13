# Express.js SQLite API

A structured Express.js API with SQLite database integration.

## Project Structure

```
project-root/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── app.js         # Express application setup
├── .gitignore
├── package.json
├── README.md
└── server.js          # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

Development mode with auto-reload:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

- `GET /api` - Welcome message
- `GET /api/items` - List all items
- `GET /api/items/:id` - Get a specific item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an existing item
- `DELETE /api/items/:id` - Delete an item

## License

MIT