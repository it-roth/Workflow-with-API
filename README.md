
# Workflow-with-API

## Project Overview

This repository contains an Employee Request System with a modern front-end and a Laravel-based back-end API. The system allows employees to submit leave and mission requests, track approval history, and manage departmental workflows. It features:

- **Front-end**: Built with Next.js and Tailwind CSS for a responsive, user-friendly interface.
- **Back-end**: Powered by Laravel, providing RESTful APIs for all core functionalities.
- **Features**:
  - Employee leave and mission request submission
  - Approval workflow and history tracking
  - Department and user management
  - Secure authentication and protected routes

## How to Clone the Project

1. Open your terminal and navigate to the directory where you want to clone the project.
2. Run the following command:

	```bash
	git clone https://github.com/it-roth/Workflow-with-API.git
	```

3. Change into the project directory:

	```bash
	cd Workflow-with-API
	```

4. Follow the setup instructions in the respective `README.md` files for the back-end (`employee-request-system/`) and front-end (`front-end/`) folders.


## Contact

- **Telegram**: [http://t.me/lengsaroth](http://t.me/lengsaroth)
- **Facebook**: [https://www.facebook.com/leng.saroth.33?mibextid=wwXIfr](https://www.facebook.com/leng.saroth.33?mibextid=wwXIfr)

## How to Run the Project

### Prerequisites

- PHP (>=7.3)
- Composer
- Node.js & npm

### 1. Run the Back-end (Laravel API)

```bash
cd employee-request-system
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

This will start the Laravel API server, usually at http://localhost:8000.

### 2. Run the Front-end (Next.js)

Open a new terminal and run:

```bash
cd front-end
npm install
npm run dev
```

This will start the Next.js development server, usually at http://localhost:3000.
