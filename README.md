# Taskline - Task Management System

A modern, full-stack task management application built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

- 📊 **Dashboard Overview**: Real-time statistics and task summaries
- ✅ **Task Management**: Create, read, update, and delete tasks
- 🔍 **Search & Filter**: Find tasks quickly with real-time search
- 📅 **Due Date Tracking**: Monitor overdue and upcoming tasks
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 📤 **Export Functionality**: Export tasks to CSV format
- 🖨️ **Print Support**: Print-friendly task reports

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Icons**: Font Awesome
- **Deployment**: Ready for Heroku, Vercel, or any Node.js hosting

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database with sample data**
   ```bash
   npm run init-db
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload
- `npm run init-db` - Initialize database with sample data

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Statistics
- `GET /api/stats` - Get task statistics (due today, this week, etc.)

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    resource TEXT,
    entity_group TEXT,
    entity TEXT,
    state TEXT,
    task_description TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Heroku Deployment

1. **Create a Heroku account** and install the Heroku CLI

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**
   ```bash
   heroku create your-app-name
   ```

4. **Deploy to Heroku**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

5. **Open your deployed app**
   ```bash
   heroku open
   ```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

### Railway Deployment

1. **Connect your GitHub repository** to Railway
2. **Railway will automatically detect** the Node.js project
3. **Deploy with one click**

## Environment Variables

Create a `.env` file in the root directory for local development:

```env
PORT=3000
NODE_ENV=development
```

## Project Structure

```
task-tracker/
├── server.js              # Express server
├── init-database.js       # Database initialization
├── package.json           # Dependencies and scripts
├── index.html            # Main HTML file
├── style.css             # Styles
├── script.js             # Frontend JavaScript
├── Procfile              # Heroku deployment
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Features in Detail

### Dashboard
- **Due Today**: Tasks due on the current date
- **Due This Week**: Tasks due within the next 7 days
- **Due Next Week**: Tasks due in 8-14 days
- **Next 15 Days**: Tasks due within the next 15 days
- **Overdue**: Tasks past their due date

### Task Management
- **Add Tasks**: Click "New Task" button to create tasks
- **Edit Tasks**: Click the edit icon to modify task details
- **Delete Tasks**: Click the delete icon to remove tasks
- **Search**: Use the search bar to filter tasks
- **Export**: Download tasks as CSV file
- **Print**: Print task reports

### Responsive Design
- **Mobile-friendly**: Optimized for smartphones and tablets
- **Desktop optimized**: Full-featured interface for larger screens
- **Print styles**: Clean print layout for reports

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@taskline.com or create an issue in the repository.

---

**Built with ❤️ for efficient task management** 